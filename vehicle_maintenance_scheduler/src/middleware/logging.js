/**
 * Logging Middleware
 * Integrates the remote logging module for request/response logging
 */

const { Log, setAuthToken } = require('../../../logging_middleware');

/**
 * Initializes the logging middleware with authentication token
 * Should be called once at server startup
 *
 * @param {string} token - Bearer token for authentication
 */
function initializeLogging(token) {
  try {
    setAuthToken(token);
  } catch (error) {
    console.error('[Logging] Failed to initialize:', error.message);
    throw error;
  }
}

/**
 * Express middleware to log all incoming requests and outgoing responses
 * Logs using the remote logging service
 *
 * @returns {Function} Express middleware function
 */
function loggingMiddleware() {
  return async (req, res, next) => {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    // Attach to request for later use
    req.requestId = requestId;
    req.authToken = req.locals?.authToken; // Will be set by server.js

    try {
      // Log incoming request
      const requestMessage = `${req.method} ${req.path}`;
      Log('backend', 'info', 'middleware', `[REQ-${requestId}] ${requestMessage}`);

      // Intercept response
      const originalSend = res.send;

      res.send = function(data) {
        const duration = Date.now() - startTime;

        // Log outgoing response
        const responseMessage = `[REQ-${requestId}] ${req.method} ${req.path} - Status: ${res.statusCode} - ${duration}ms`;
        
        const logLevel = res.statusCode >= 400 ? 'error' : 'info';
        Log('backend', logLevel, 'middleware', responseMessage);

        // Call original send
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      Log('backend', 'error', 'middleware', `Middleware error: ${error.message}`);
      next(error);
    }
  };
}

/**
 * Global error handler middleware
 * Logs errors and returns error response
 *
 * @returns {Function} Express error handler
 */
function errorHandler() {
  return (err, req, res, next) => {
    Log('backend', 'error', 'middleware', `Error: ${err.message}`);

    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  };
}

// Export middleware functions
module.exports = {
  initializeLogging,
  loggingMiddleware,
  errorHandler
};
