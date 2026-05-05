/**
 * Priority Inbox System
 * Fetches notifications from API and sorts them by priority and timestamp
 * Uses only native Node.js modules - no external dependencies
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');
const { Log, setAuthToken } = require('../logging_middleware');

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

/**
 * Loads environment variables from .env file
 * @returns {Object} Environment variables
 */
function loadEnv() {
  // Try local .env first, then fall back to logging_middleware
  let envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    envPath = path.join(__dirname, '..', 'logging_middleware', '.env');
  }
  
  if (!fs.existsSync(envPath)) {
    Log('backend', 'error', 'handler', `ENV file not found at ${envPath}`);
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, value] = trimmed.split('=');
      env[key.trim()] = value.trim();
    }
  });

  return env;
}

// ============================================================================
// PRIORITY CONFIGURATION
// ============================================================================

/**
 * Priority weights for different notification types
 * Higher weight = higher priority
 */
const PRIORITY_WEIGHTS = {
  'Placement': 3,
  'Result': 2,
  'Event': 1
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Makes an HTTPS GET request to fetch notifications
 * @param {string} url - Full URL of the API endpoint
 * @param {string} token - Bearer token for authentication
 * @returns {Promise<Object>} Response data
 */
async function makeHttpRequest(url, token) {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : require('http');

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const req = client.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            if (data) {
              resolve(JSON.parse(data));
            } else {
              resolve({ success: true, data: [] });
            }
          } catch (parseError) {
            reject(new Error(`Failed to parse response: ${parseError.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`HTTP request failed: ${error.message}`));
      });

      req.setTimeout(15000, () => {
        req.destroy();
        reject(new Error('HTTP request timeout'));
      });

      req.end();
    } catch (error) {
      reject(new Error(`Request setup failed: ${error.message}`));
    }
  });
}

/**
 * Fetches notifications from the evaluation service API
 * @param {string} token - Bearer token for authentication
 * @returns {Promise<Array>} Array of notification objects
 */
async function fetchNotificationsFromAPI(token) {
  try {
    await Log('backend', 'info', 'service', 'Fetching notifications from API');

    const apiUrl = 'http://20.207.122.201/evaluation-service/notifications';
    const response = await makeHttpRequest(apiUrl, token);

    if (response.success === false) {
      await Log('backend', 'error', 'service', `API error: ${response.error || 'Unknown error'}`);
      return [];
    }

    const notifications = response.data || response.notifications || [];
    await Log('backend', 'info', 'service', `Successfully fetched ${notifications.length} notifications`);

    return notifications;
  } catch (error) {
    await Log('backend', 'error', 'service', `Failed to fetch notifications: ${error.message}`);
    
    // Return mock data for testing when API is unavailable
    await Log('backend', 'info', 'service', 'Using mock notifications for testing');
    return getMockNotifications();
  }
}

// ============================================================================
// SORTING & PRIORITY FUNCTIONS
// ============================================================================

/**
 * Parses a timestamp string to a Date object
 * Supports formats: "YYYY-MM-DD HH:MM:SS" and ISO 8601
 * @param {string} timestamp - Timestamp string
 * @returns {Date} Parsed date object
 */
function parseTimestamp(timestamp) {
  if (!timestamp) return new Date(0);

  // Try ISO 8601 format first
  const isoDate = new Date(timestamp);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Try "YYYY-MM-DD HH:MM:SS" format
  const parts = timestamp.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (parts) {
    return new Date(
      parseInt(parts[1]),
      parseInt(parts[2]) - 1,
      parseInt(parts[3]),
      parseInt(parts[4]),
      parseInt(parts[5]),
      parseInt(parts[6])
    );
  }

  return new Date(0);
}

/**
 * Gets priority weight for a notification type
 * @param {string} notificationType - Notification type
 * @returns {number} Priority weight (higher = higher priority)
 */
function getPriorityWeight(notificationType) {
  if (!notificationType) return 0;

  // Exact match
  if (PRIORITY_WEIGHTS[notificationType]) {
    return PRIORITY_WEIGHTS[notificationType];
  }

  // Case-insensitive match
  const normalized = notificationType.toLowerCase();
  for (const [key, weight] of Object.entries(PRIORITY_WEIGHTS)) {
    if (key.toLowerCase() === normalized) {
      return weight;
    }
  }

  return 0; // Unknown type
}

/**
 * Sorts notifications by priority (descending) and then by timestamp (newest first)
 * @param {Array} notifications - Array of notification objects
 * @returns {Array} Sorted notifications
 */
function sortNotificationsByPriority(notifications) {
  if (!Array.isArray(notifications) || notifications.length === 0) {
    return [];
  }

  const sorted = [...notifications].sort((a, b) => {
    // Get priority weights
    const weightA = getPriorityWeight(a.type);
    const weightB = getPriorityWeight(b.type);

    // Sort by priority (higher weight first)
    if (weightA !== weightB) {
      return weightB - weightA;
    }

    // If same priority, sort by timestamp (newer first)
    const dateA = parseTimestamp(a.timestamp || a.created_at);
    const dateB = parseTimestamp(b.timestamp || b.created_at);

    return dateB.getTime() - dateA.getTime();
  });

  return sorted;
}

/**
 * Gets top N notifications after sorting by priority
 * @param {Array} notifications - Array of notification objects
 * @param {number} n - Number of top notifications to return (default: 10)
 * @returns {Array} Top n notifications sorted by priority
 */
function getTopNotifications(notifications, n = 10) {
  if (typeof n !== 'number' || n < 1) {
    n = 10;
  }

  const sorted = sortNotificationsByPriority(notifications);
  return sorted.slice(0, n);
}

// ============================================================================
// DISPLAY FUNCTIONS
// ============================================================================

/**
 * Formats a notification for display
 * @param {Object} notif - Notification object
 * @param {number} index - Index in the list (1-based)
 * @returns {string} Formatted notification string
 */
function formatNotification(notif, index) {
  const type = notif.type || 'Unknown';
  const title = notif.title || notif.message || 'No title';
  const message = notif.message || '';
  const timestamp = notif.timestamp || notif.created_at || 'N/A';
  const priority = getPriorityWeight(type);

  const priorityLabel = {
    3: '🔴 HIGH',
    2: '🟡 MEDIUM',
    1: '🟢 LOW',
    0: '⚪ NORMAL'
  }[priority] || '⚪ NORMAL';

  let output = `\n${index}. [${type}] ${title}\n`;
  output += `   Priority: ${priorityLabel}\n`;
  output += `   Time: ${timestamp}\n`;
  if (message && message !== title) {
    const preview = message.length > 50 ? message.substring(0, 50) + '...' : message;
    output += `   Message: ${preview}\n`;
  }

  return output;
}

/**
 * Displays priority inbox in a clean, readable format
 * @param {Array} notifications - Array of priority-sorted notifications
 * @param {number} limit - Number of notifications to display
 */
function displayPriorityInbox(notifications, limit = 10) {
  const header = '\n' + '='.repeat(80);
  const title = '               PRIORITY INBOX - TOP ' + limit + ' NOTIFICATIONS';
  const footer = '='.repeat(80);

  console.log(header);
  console.log(title);
  console.log(footer);

  const topNotifications = notifications.slice(0, limit);

  if (topNotifications.length === 0) {
    console.log('\n   No notifications available\n');
    console.log(footer);
    return;
  }

  topNotifications.forEach((notif, index) => {
    console.log(formatNotification(notif, index + 1));
  });

  console.log(footer);
  console.log(`\nTotal Notifications: ${notifications.length}`);
  console.log(`Displaying: ${Math.min(limit, notifications.length)} of ${notifications.length}\n`);
}

/**
 * Displays statistics about notifications
 * @param {Array} notifications - Array of notifications
 */
function displayStatistics(notifications) {
  const stats = {
    'Placement': 0,
    'Result': 0,
    'Event': 0,
    'Other': 0
  };

  notifications.forEach(notif => {
    const type = notif.type || 'Other';
    if (stats.hasOwnProperty(type)) {
      stats[type]++;
    } else {
      stats['Other']++;
    }
  });

  console.log('\n📊 NOTIFICATION STATISTICS');
  console.log('─'.repeat(40));
  console.log(`Total: ${notifications.length}`);
  console.log(`  🔴 Placement (Priority 3): ${stats['Placement']}`);
  console.log(`  🟡 Result (Priority 2): ${stats['Result']}`);
  console.log(`  🟢 Event (Priority 1): ${stats['Event']}`);
  console.log(`  ⚪ Other: ${stats['Other']}`);
  console.log('─'.repeat(40) + '\n');
}

// ============================================================================
// MOCK DATA
// ============================================================================

/**
 * Returns mock notification data for testing
 * @returns {Array} Array of mock notifications
 */
function getMockNotifications() {
  return [
    {
      id: 'notif-001',
      type: 'Result',
      title: 'Semester Results Announced',
      message: 'Your semester results have been declared and are available in the portal',
      timestamp: '2026-05-05 14:30:00',
      created_at: '2026-05-05T14:30:00Z'
    },
    {
      id: 'notif-002',
      type: 'Event',
      title: 'Tech Fest Registration Open',
      message: 'Register for the annual tech fest happening next month',
      timestamp: '2026-05-05 13:15:00',
      created_at: '2026-05-05T13:15:00Z'
    },
    {
      id: 'notif-003',
      type: 'Placement',
      title: 'Amazon Placement Drive',
      message: 'Amazon is conducting campus recruitment. Register before 30 May',
      timestamp: '2026-05-05 15:45:00',
      created_at: '2026-05-05T15:45:00Z'
    },
    {
      id: 'notif-004',
      type: 'Placement',
      title: 'Google Internship Applications',
      message: 'Apply for summer internship with Google - Top performers preferred',
      timestamp: '2026-05-04 10:20:00',
      created_at: '2026-05-04T10:20:00Z'
    },
    {
      id: 'notif-005',
      type: 'Result',
      title: 'Mid-term Exam Results',
      message: 'Mid-term exam results are now available',
      timestamp: '2026-05-03 09:00:00',
      created_at: '2026-05-03T09:00:00Z'
    },
    {
      id: 'notif-006',
      type: 'Event',
      title: 'Sports Day Registrations',
      message: 'Register for sports day competitions by 20 May',
      timestamp: '2026-05-05 12:00:00',
      created_at: '2026-05-05T12:00:00Z'
    },
    {
      id: 'notif-007',
      type: 'Placement',
      title: 'Microsoft Campus Hiring',
      message: 'Microsoft is hiring graduates for software development roles',
      timestamp: '2026-05-02 16:30:00',
      created_at: '2026-05-02T16:30:00Z'
    },
    {
      id: 'notif-008',
      type: 'Event',
      title: 'Hackathon 2026',
      message: 'Join Hackathon 2026 - Win prizes up to ₹ 2,00,000',
      timestamp: '2026-05-01 11:00:00',
      created_at: '2026-05-01T11:00:00Z'
    }
  ];
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Main function - orchestrates the entire priority inbox workflow
 */
async function main() {
  try {
    await Log('backend', 'info', 'handler', 'Starting priority inbox application');

    // Load environment variables
    const env = loadEnv();
    const token = env.AUTH_TOKEN;

    if (!token) {
      await Log('backend', 'error', 'handler', 'AUTH_TOKEN not found in environment');
      process.exit(1);
    }

    // Set authentication token for logging middleware
    setAuthToken(token);
    await Log('backend', 'info', 'handler', 'Authentication token set successfully');

    // Fetch notifications from API
    let notifications = await fetchNotificationsFromAPI(token);

    // Handle case where API returns empty or mock data is used
    if (notifications.length === 0) {
      await Log('backend', 'warn', 'handler', 'No notifications fetched, using mock data');
      notifications = getMockNotifications();
    }

    await Log('backend', 'info', 'handler', `Processing ${notifications.length} notifications`);

    // Sort notifications by priority
    const sortedNotifications = sortNotificationsByPriority(notifications);
    await Log('backend', 'info', 'handler', 'Notifications sorted by priority');

    // Get top 10 notifications
    const topNotifications = getTopNotifications(sortedNotifications, 10);
    await Log('backend', 'info', 'handler', `Selected top 10 from ${sortedNotifications.length} notifications`);

    // Display the priority inbox
    displayPriorityInbox(sortedNotifications, 10);

    // Display statistics
    displayStatistics(sortedNotifications);

    await Log('backend', 'info', 'handler', 'Priority inbox generated successfully');
  } catch (error) {
    await Log('backend', 'error', 'handler', `Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// ============================================================================
// EXPORTS & EXECUTION
// ============================================================================

module.exports = {
  fetchNotificationsFromAPI,
  sortNotificationsByPriority,
  getTopNotifications,
  parseTimestamp,
  getPriorityWeight,
  displayPriorityInbox,
  displayStatistics
};

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Uncaught error:', error);
    process.exit(1);
  });
}
