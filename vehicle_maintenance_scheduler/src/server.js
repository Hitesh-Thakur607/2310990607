/**
 * Vehicle Maintenance Scheduler - Main Server
 * Microservice for optimizing vehicle maintenance task scheduling
 * Uses 0/1 Knapsack algorithm to maximize impact within time constraints
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { initializeLogging, loggingMiddleware, errorHandler } = require('./middleware/logging');
const scheduleRoutes = require('./routes/schedule');

/**
 * Loads environment variables from .env file
 * @private
 * @returns {Object} Environment variables
 */
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');

  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found. Please create it with AUTH_TOKEN and PORT.');
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};

  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        env[key.trim()] = value.trim();
      }
    }
  }

  return env;
}

/**
 * Initializes and starts the Express server
 */
async function startServer() {
  try {
    // Load environment variables
    const env = loadEnv();
    const PORT = parseInt(env.PORT) || 3000;
    const AUTH_TOKEN = env.AUTH_TOKEN;

    if (!AUTH_TOKEN) {
      throw new Error('AUTH_TOKEN is not set in .env file');
    }

    // Create Express app
    const app = express();

    // Middleware to parse JSON
    app.use(express.json());

    // Attach token to request object for use in controllers
    app.use((req, res, next) => {
      req.locals = req.locals || {};
      req.locals.authToken = AUTH_TOKEN;
      next();
    });

    // Initialize logging with token
    initializeLogging(AUTH_TOKEN);

    // Apply logging middleware globally
    app.use(loggingMiddleware());

    // Health check route (before schedule routes)
    app.use('/api/schedule', scheduleRoutes);

    // Root endpoint
    app.get('/', (req, res) => {
      res.status(200).json({
        service: 'Vehicle Maintenance Scheduler',
        version: '1.0.0',
        endpoints: {
          health: 'GET /api/schedule/health',
          optimize: 'GET /api/schedule/optimize'
        }
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    });

    // Error handler
    app.use(errorHandler());

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Vehicle Maintenance Scheduler running on port ${PORT}`);
      console.log(`✓ Logging middleware initialized`);
      console.log(`✓ Ready to accept requests`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();
