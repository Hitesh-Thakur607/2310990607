/**
 * Schedule Routes
 * Defines all API endpoints for the scheduler service
 */

const express = require('express');
const {
  getOptimizedSchedule,
  getHealthStatus
} = require('../controllers/schedulerController');

const router = express.Router();

/**
 * GET /api/schedule/optimize
 * Optimizes maintenance task scheduling using knapsack algorithm
 * Returns optimal task selection with maximum impact within time constraints
 */
router.get('/optimize', getOptimizedSchedule);

/**
 * GET /api/schedule/health
 * Health check endpoint
 * Returns service status and timestamp
 */
router.get('/health', getHealthStatus);

module.exports = router;
