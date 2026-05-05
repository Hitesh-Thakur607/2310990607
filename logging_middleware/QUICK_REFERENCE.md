# Quick Reference Guide

## Import the Module

```javascript
const { setAuthToken, Log, VALID_STACKS, VALID_LEVELS, VALID_PACKAGES } = require('./index');
```

## Set Token

```javascript
setAuthToken('your-bearer-token');
```

## Send a Log

```javascript
const logId = await Log(stack, level, packageName, message);
```

## Examples

### Basic
```javascript
await Log('backend', 'info', 'controller', 'User logged in');
```

### With Error Handling
```javascript
const logId = await Log('backend', 'error', 'handler', 'Failed to process');
if (logId) console.log('Logged:', logId);
```

### All Levels
```javascript
await Log('backend', 'debug', 'service', 'Debug information');
await Log('backend', 'info', 'service', 'Info message');
await Log('backend', 'warn', 'service', 'Warning message');
await Log('backend', 'error', 'service', 'Error message');
await Log('backend', 'fatal', 'service', 'Fatal message');
```

### Different Packages
```javascript
await Log('backend', 'info', 'controller', 'In controller');
await Log('backend', 'info', 'service', 'In service');
await Log('backend', 'info', 'db', 'In database');
await Log('backend', 'info', 'route', 'In route');
await Log('backend', 'info', 'middleware', 'In middleware');
await Log('backend', 'info', 'auth', 'In auth');
await Log('backend', 'info', 'handler', 'In handler');
```

### Frontend Logs
```javascript
await Log('frontend', 'info', 'component', 'Component mounted');
await Log('frontend', 'error', 'hook', 'Hook error');
await Log('frontend', 'debug', 'state', 'State updated');
```

## Valid Values Reference

| Parameter | Valid Options |
|-----------|---------------|
| `stack` | `"backend"`, `"frontend"` |
| `level` | `"debug"`, `"info"`, `"warn"`, `"error"`, `"fatal"` |
| `package` | See VALID_PACKAGES array (19 options) |
| `message` | Non-empty string |

## Error Scenarios (Silent/Safe)

```javascript
// No token set - logs error, returns null
await Log('backend', 'info', 'service', 'test');

// Invalid stack - logs error, returns null
await Log('invalid', 'info', 'service', 'test');

// Invalid level - logs error, returns null
await Log('backend', 'invalid', 'service', 'test');

// Invalid package - logs error, returns null
await Log('backend', 'info', 'invalid', 'test');

// Empty message - logs error, returns null
await Log('backend', 'info', 'service', '');

// Network/API error - logs error, returns null
// (doesn't crash the app)
```

## Express.js Quick Setup

```javascript
const express = require('express');
const { setAuthToken, Log } = require('./index');

const app = express();

// Initialize token
setAuthToken(process.env.AUTH_TOKEN);

// Log middleware
app.use((req, res, next) => {
  Log('backend', 'debug', 'middleware', `${req.method} ${req.path}`);
  next();
});

// Route
app.get('/test', async (req, res) => {
  await Log('backend', 'info', 'route', 'GET /test');
  res.json({ ok: true });
});

app.listen(3000);
```

## Test the Module

```bash
node test.js
```

## Run Examples

Edit `examples.js` to uncomment desired example, then:

```bash
node examples.js
```

## Environment Setup

```bash
# Copy example
cp .env.example .env

# Edit .env
# AUTH_TOKEN=your-actual-token

# Use in code
require('dotenv').config();
setAuthToken(process.env.AUTH_TOKEN);
```

## HTTP Details

- **Endpoint:** `http://20.207.122.201/evaluation-service/logs`
- **Method:** POST
- **Auth:** Bearer token in Authorization header
- **Body:** JSON with stack, level, package, message
- **Response:** JSON with logID field

## Common Patterns

### Log on Error
```javascript
try {
  // your code
} catch (error) {
  await Log('backend', 'error', 'handler', error.message);
}
```

### Log User Action
```javascript
app.post('/action', async (req, res) => {
  await Log('backend', 'info', 'controller', `User action: ${req.body.action}`);
  res.json({ ok: true });
});
```

### Log Database Operations
```javascript
await Log('backend', 'debug', 'db', 'Query started');
const result = await database.query(sql);
await Log('backend', 'info', 'db', `Query complete: ${result.length} rows`);
```

### Log Service Operations
```javascript
await Log('backend', 'debug', 'service', 'Processing started');
const data = await processData(input);
await Log('backend', 'info', 'service', 'Processing complete');
```
