/**
 * Example Usage of the Logging Middleware
 */

const { setAuthToken, Log, VALID_STACKS, VALID_LEVELS, VALID_PACKAGES } = require('./index');

/**
 * Example 1: Basic usage
 */
async function example1_basicUsage() {
  console.log('\n=== Example 1: Basic Usage ===\n');

  // Set the Bearer token (obtained from authentication)
  setAuthToken('your-bearer-token-here');

  // Send a log
  const logId = await Log('backend', 'info', 'controller', 'User logged in successfully');
  console.log('Returned LogID:', logId);
}

/**
 * Example 2: Using environment variables for token
 */
async function example2_withEnvToken() {
  console.log('\n=== Example 2: Using Environment Variables ===\n');

  // Load token from environment variable
  const token = process.env.AUTH_TOKEN || 'your-token-here';
  setAuthToken(token);

  // Send logs at different levels
  const debugLog = await Log('backend', 'debug', 'service', 'Service initialization started');
  const infoLog = await Log('backend', 'info', 'db', 'Database connection established');
  const warnLog = await Log('backend', 'warn', 'cache', 'Cache miss detected');
  const errorLog = await Log('backend', 'error', 'handler', 'Request processing failed');

  console.log('Debug LogID:', debugLog);
  console.log('Info LogID:', infoLog);
  console.log('Warn LogID:', warnLog);
  console.log('Error LogID:', errorLog);
}

/**
 * Example 3: Error handling and validation
 */
async function example3_errorHandling() {
  console.log('\n=== Example 3: Error Handling ===\n');

  setAuthToken('token-here');

  // Invalid stack - will fail silently and return null
  const result1 = await Log('invalid_stack', 'info', 'service', 'Test message');
  console.log('Invalid stack result:', result1); // null

  // Invalid level - will fail silently and return null
  const result2 = await Log('backend', 'invalid_level', 'service', 'Test message');
  console.log('Invalid level result:', result2); // null

  // Invalid package - will fail silently and return null
  const result3 = await Log('backend', 'info', 'invalid_package', 'Test message');
  console.log('Invalid package result:', result3); // null

  // Empty message - will fail silently and return null
  const result4 = await Log('backend', 'info', 'service', '');
  console.log('Empty message result:', result4); // null
}

/**
 * Example 4: Using with Express.js
 */
async function example4_expressIntegration() {
  console.log('\n=== Example 4: Express.js Integration ===\n');

  const code = `
const express = require('express');
const { setAuthToken, Log } = require('./index');

const app = express();

// Set token on startup
const TOKEN = process.env.AUTH_TOKEN;
setAuthToken(TOKEN);

// Middleware to log all requests
app.use((req, res, next) => {
  Log('backend', 'debug', 'middleware', \`\${req.method} \${req.path}\`);
  next();
});

// Example route
app.get('/api/users', async (req, res) => {
  // Log the action
  await Log('backend', 'info', 'route', 'GET /api/users endpoint called');
  
  try {
    // Your logic here
    await Log('backend', 'debug', 'service', 'Fetching users from database');
    res.json({ users: [] });
  } catch (error) {
    await Log('backend', 'error', 'handler', \`Error: \${error.message}\`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
  `;

  console.log(code);
}

/**
 * Example 5: Viewing valid values
 */
function example5_viewValidValues() {
  console.log('\n=== Example 5: Valid Values ===\n');

  console.log('Valid Stacks:', VALID_STACKS);
  console.log('Valid Levels:', VALID_LEVELS);
  console.log('Valid Packages:', VALID_PACKAGES);
}

/**
 * Example 6: Multiple logs in sequence
 */
async function example6_multipleLogsSequence() {
  console.log('\n=== Example 6: Multiple Logs in Sequence ===\n');

  setAuthToken('your-token-here');

  const logs = [
    { stack: 'backend', level: 'info', package: 'route', message: 'GET /api/posts endpoint' },
    { stack: 'backend', level: 'debug', package: 'service', message: 'Fetching posts from database' },
    { stack: 'backend', level: 'info', package: 'db', message: 'Query executed successfully' },
    { stack: 'backend', level: 'debug', package: 'service', message: 'Applying filters to results' },
    { stack: 'backend', level: 'info', package: 'route', message: 'Response sent to client' }
  ];

  for (const logEntry of logs) {
    const logId = await Log(
      logEntry.stack,
      logEntry.level,
      logEntry.package,
      logEntry.message
    );
    console.log(`Sent: ${logEntry.message} -> LogID: ${logId}`);
  }
}

// Uncomment the example you want to run:
// Uncomment one or more of the following:
// example1_basicUsage();
// example2_withEnvToken();
// example3_errorHandling();
// example4_expressIntegration();
// example5_viewValidValues();
// example6_multipleLogsSequence();

console.log('This file contains usage examples for the logging middleware.');
console.log('Uncomment the example you want to run and execute: node examples.js');
