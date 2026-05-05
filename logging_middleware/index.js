/**
 * Logging Middleware Module
 * Sends structured logs to the evaluation service with Bearer token authentication
 * Uses native Node.js fetch API (Node.js 18+)
 */

// Valid values for log parameters
const VALID_STACKS = ['backend', 'frontend'];

const VALID_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];

const VALID_PACKAGES = [
  'cache',
  'controller',
  'cron_job',
  'db',
  'domain',
  'handler',
  'repository',
  'route',
  'service',
  'api',
  'component',
  'hook',
  'page',
  'state',
  'style',
  'auth',
  'config',
  'middleware',
  'utils'
];

// Service configuration
const LOG_SERVICE_URL = 'http://20.207.122.201/evaluation-service/logs';

// Store the Bearer token in memory
let authToken = null;

/**
 * Sets the Bearer token for authentication
 * This token is used in all subsequent log requests
 *
 * @param {string} token - The Bearer token from authentication
 * @throws {Error} If token is not a non-empty string
 */
function setAuthToken(token) {
  if (typeof token !== 'string' || token.trim() === '') {
    console.error('[Logger] Error: setAuthToken received invalid token');
    throw new Error('Token must be a non-empty string');
  }
  authToken = token;
  console.log('[Logger] Auth token set successfully');
}

/**
 * Validates the log parameters
 *
 * @param {string} stack - Stack type (backend/frontend)
 * @param {string} level - Log level (debug/info/warn/error/fatal)
 * @param {string} packageName - Package/module name
 * @param {string} message - Log message
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateLogParams(stack, level, packageName, message) {
  const errors = [];

  // Validate stack
  if (!VALID_STACKS.includes(stack)) {
    errors.push(`Invalid stack: "${stack}". Allowed: ${VALID_STACKS.join(', ')}`);
  }

  // Validate level
  if (!VALID_LEVELS.includes(level)) {
    errors.push(`Invalid level: "${level}". Allowed: ${VALID_LEVELS.join(', ')}`);
  }

  // Validate packageName
  if (!VALID_PACKAGES.includes(packageName)) {
    errors.push(`Invalid package: "${packageName}". Allowed: ${VALID_PACKAGES.join(', ')}`);
  }

  // Validate message
  if (typeof message !== 'string' || message.trim() === '') {
    errors.push('Message must be a non-empty string');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sends a log to the remote evaluation service
 * Validates all parameters and includes Bearer token authentication
 *
 * @param {string} stack - Stack type ('backend' or 'frontend')
 * @param {string} level - Log level ('debug', 'info', 'warn', 'error', 'fatal')
 * @param {string} packageName - Package/module name
 * @param {string} message - Log message to send
 * @returns {Promise<string|null>} Log ID from response or null on error
 */
async function Log(stack, level, packageName, message) {
  try {
    // Validate parameters before sending
    const validation = validateLogParams(stack, level, packageName, message);
    if (!validation.valid) {
      console.error('[Logger] Validation failed:', validation.errors.join('; '));
      return null;
    }

    // Check if token is set
    if (!authToken) {
      console.error('[Logger] No auth token set. Call setAuthToken() first');
      return null;
    }

    // Prepare request payload
    const payload = {
      stack,
      level,
      package: packageName,
      message
    };

    // Make POST request to log service with Bearer token
    const response = await fetch(LOG_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    // Check if response is successful (status 200-299)
    if (!response.ok) {
      console.error(
        `[Logger] HTTP error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    // Parse response JSON
    const responseData = await response.json();

    // Extract logID from response (handle different possible field names)
    const logId = responseData.logID || responseData.id || responseData.logId;

    if (!logId) {
      console.warn('[Logger] Response received but no logID found in response');
      return null;
    }

    console.log(`[Logger] Log sent successfully. LogID: ${logId}`);
    return logId;
  } catch (error) {
    // Fail silently - log the error but don't crash the application
    console.error('[Logger] Failed to send log:', error.message);
    return null;
  }
}

// Export functions and constants for use
module.exports = {
  setAuthToken,
  Log,
  VALID_STACKS,
  VALID_LEVELS,
  VALID_PACKAGES
};
