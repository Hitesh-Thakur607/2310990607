# Logging Middleware Module

A lightweight, production-grade logging middleware for Node.js that sends structured logs to a remote evaluation service with Bearer token authentication.

## Features

- ✅ Bearer token authentication
- ✅ Parameter validation (stack, level, package, message)
- ✅ Native Node.js fetch API (Node.js 18+)
- ✅ Graceful error handling (app continues if logging fails)
- ✅ No external dependencies
- ✅ Exported validation arrays for testing
- ✅ Production-grade error logging

## Installation

Copy `index.js` to your project and require it:

```javascript
const { setAuthToken, Log, VALID_STACKS, VALID_LEVELS, VALID_PACKAGES } = require('./index');
```

**Requirements:** Node.js 18+ (for native fetch API)

## Quick Start

```javascript
const { setAuthToken, Log } = require('./index');

// Set the Bearer token (from your authentication)
setAuthToken('your-bearer-token');

// Send a log
const logId = await Log('backend', 'info', 'controller', 'Action completed');
console.log('Log ID:', logId); // Returns the logID or null on error
```

## API Reference

### `setAuthToken(token)`

Sets the Bearer token for authentication. Must be called before sending logs.

**Parameters:**
- `token` (string, required) - The Bearer token from authentication

**Throws:**
- `Error` if token is not a non-empty string

**Example:**
```javascript
setAuthToken(process.env.AUTH_TOKEN);
```

### `Log(stack, level, packageName, message)`

Sends a log to the remote evaluation service.

**Parameters:**
- `stack` (string, required) - Stack type: `"backend"` or `"frontend"`
- `level` (string, required) - Log level: `"debug"`, `"info"`, `"warn"`, `"error"`, or `"fatal"`
- `packageName` (string, required) - Package/module name (see valid packages)
- `message` (string, required) - Log message (non-empty)

**Returns:**
- `Promise<string|null>` - LogID from response or null if failed

**Example:**
```javascript
const logId = await Log('backend', 'info', 'controller', 'User logged in');
if (logId) {
  console.log('Log sent:', logId);
} else {
  console.log('Failed to send log, but app continues');
}
```

### Exported Validation Arrays

```javascript
const { VALID_STACKS, VALID_LEVELS, VALID_PACKAGES } = require('./index');

// Use for validation or testing
console.log(VALID_STACKS);   // ['backend', 'frontend']
console.log(VALID_LEVELS);   // ['debug', 'info', 'warn', 'error', 'fatal']
console.log(VALID_PACKAGES); // [... array of 19 package names ...]
```

## Valid Values

### Stacks
- `backend`
- `frontend`

### Levels
- `debug`
- `info`
- `warn`
- `error`
- `fatal`

### Packages
- `cache`
- `controller`
- `cron_job`
- `db`
- `domain`
- `handler`
- `repository`
- `route`
- `service`
- `api`
- `component`
- `hook`
- `page`
- `state`
- `style`
- `auth`
- `config`
- `middleware`
- `utils`

## Usage Examples

### Example 1: Basic Usage

```javascript
const { setAuthToken, Log } = require('./index');

async function main() {
  setAuthToken('my-token-xyz');
  
  const logId = await Log('backend', 'info', 'service', 'Service started');
  console.log('Log ID:', logId);
}

main();
```

### Example 2: Environment Variables

```javascript
const { setAuthToken, Log } = require('./index');

// Load token from environment
setAuthToken(process.env.AUTH_TOKEN);

// Send logs
await Log('backend', 'info', 'handler', 'Processing request');
await Log('backend', 'debug', 'db', 'Query executed');
```

### Example 3: Express.js Integration

```javascript
const express = require('express');
const { setAuthToken, Log } = require('./index');

const app = express();

// Set token on startup
setAuthToken(process.env.AUTH_TOKEN);

// Middleware to log all requests
app.use((req, res, next) => {
  Log('backend', 'debug', 'middleware', `${req.method} ${req.path}`);
  next();
});

// Route with logging
app.get('/api/users', async (req, res) => {
  await Log('backend', 'info', 'route', 'GET /api/users');
  
  try {
    await Log('backend', 'debug', 'db', 'Fetching users from database');
    const users = []; // Your logic here
    
    await Log('backend', 'info', 'controller', 'Users fetched successfully');
    res.json(users);
  } catch (error) {
    await Log('backend', 'error', 'handler', `Error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000);
```

### Example 4: Error Handling

```javascript
const { setAuthToken, Log } = require('./index');

setAuthToken('token');

// Invalid parameters - returns null and logs error
const result1 = await Log('invalid', 'info', 'service', 'test');   // null
const result2 = await Log('backend', 'bad', 'service', 'test');    // null
const result3 = await Log('backend', 'info', 'bad', 'test');       // null
const result4 = await Log('backend', 'info', 'service', '');       // null

// All fail gracefully - app continues working
```

### Example 5: Logging Multiple Events

```javascript
const { setAuthToken, Log } = require('./index');

setAuthToken('token');

const events = [
  { stack: 'backend', level: 'info', package: 'route', message: 'Request received' },
  { stack: 'backend', level: 'debug', package: 'auth', message: 'Validating token' },
  { stack: 'backend', level: 'debug', package: 'db', message: 'Query began' },
  { stack: 'backend', level: 'info', package: 'service', message: 'Processing complete' },
  { stack: 'backend', level: 'info', package: 'route', message: 'Response sent' }
];

for (const event of events) {
  const logId = await Log(event.stack, event.level, event.package, event.message);
  console.log(logId ? `Logged: ${event.message}` : 'Failed to log');
}
```

## Error Handling

The module handles errors gracefully and never crashes the application:

```javascript
// Network error - logs error, returns null
const result1 = await Log('backend', 'info', 'service', 'test');

// Invalid parameters - logs error, returns null
const result2 = await Log('invalid', 'info', 'service', 'test');

// Missing token - logs error, returns null
// (when setAuthToken was never called)

// App continues working regardless of log failures
```

## HTTP Request Details

The `Log()` function makes a POST request with:

**URL:** `http://20.207.122.201/evaluation-service/logs`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Body:**
```json
{
  "stack": "backend",
  "level": "info",
  "package": "controller",
  "message": "User action"
}
```

**Response:**
```json
{
  "logID": "abc-123-def-456"
}
```

## Testing

Run the test suite:

```bash
node test.js
```

This will test:
- Exported values
- Validation arrays
- Token validation
- Parameter validation
- Error handling

## Important Notes

1. **Call `setAuthToken()` first** - No logs will be sent without a token
2. **Silent failures** - If logging fails, the app continues normally
3. **No external dependencies** - Uses only native Node.js fetch API
4. **Node.js 18+** - Requires native fetch support
5. **Validation before sending** - All parameters validated client-side

## Environment Variables

Store your token in environment variables:

```bash
export AUTH_TOKEN="your-bearer-token"
```

Then use:

```javascript
setAuthToken(process.env.AUTH_TOKEN);
```

## Files Included

- `index.js` - Main module (core implementation)
- `examples.js` - Usage examples
- `test.js` - Test suite
- `package.json` - NPM configuration (if needed)

## License

MIT
