/**
 * Scheduler Controller
 * Orchestrates the optimization of maintenance task scheduling
 * Fetches data from APIs and applies knapsack algorithm
 */

const { fetchDepot, fetchVehicles } = require('../services/apiClient');
const { solveKnapsack } = require('../services/knapsackSolver');
const { Log } = require('../../../logging_middleware');

/**
 * Handles the optimize schedule endpoint
 * Coordinates fetching data and running optimization algorithm
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getOptimizedSchedule(req, res) {
  const requestStartTime = Date.now();

  try {
    Log('backend', 'debug', 'controller', 'Starting optimization request');

    // Extract token from request (should be set by middleware)
    const token = req.authToken;

    if (!token) {
      Log('backend', 'error', 'controller', 'Missing authentication token');
      return res.status(401).json({
        success: false,
        error: 'Missing authentication token'
      });
    }

    // Fetch depot and vehicles data in parallel
    Log('backend', 'debug', 'controller', 'Fetching depot and vehicles data');

    const [depotData, vehiclesData] = await Promise.all([
      fetchDepot(token),
      fetchVehicles(token)
    ]);

    Log('backend', 'debug', 'controller', 'Data fetched successfully');

    // Extract mechanic hours from depot
    const mechanicHours = depotData?.mechanic_hours || depotData?.['Mechanic Hours'] || 0;

    if (mechanicHours <= 0) {
      Log('backend', 'warn', 'controller', 'Invalid mechanic hours in depot data');
      return res.status(400).json({
        success: false,
        error: 'Invalid mechanic hours'
      });
    }

    // Extract tasks from vehicles
    // Handle various possible response formats
    let tasks = [];

    if (Array.isArray(vehiclesData)) {
      tasks = vehiclesData;
    } else if (vehiclesData?.vehicles && Array.isArray(vehiclesData.vehicles)) {
      tasks = vehiclesData.vehicles;
    } else if (vehiclesData?.tasks && Array.isArray(vehiclesData.tasks)) {
      tasks = vehiclesData.tasks;
    } else if (vehiclesData?.data && Array.isArray(vehiclesData.data)) {
      tasks = vehiclesData.data;
    }

    // Map tasks to knapsack format {id, duration, impact}
    const formattedTasks = tasks.map(task => ({
      id: task.TaskID || task.id || task.taskId || 'unknown',
      duration: parseFloat(task.Duration || task.duration || 0),
      impact: parseInt(task.Impact || task.impact || 0)
    })).filter(task => task.duration > 0 && task.impact > 0);

    Log('backend', 'debug', 'controller', `Formatted ${formattedTasks.length} tasks for optimization`);

    // Solve knapsack
    const optimizationResult = solveKnapsack(formattedTasks, mechanicHours);

    // Calculate response time
    const responseTime = Date.now() - requestStartTime;

    Log('backend', 'info', 'controller', `Optimization completed in ${responseTime}ms`);

    // Build response
    const response = {
      success: true,
      response_time_ms: responseTime,
      data: {
        mechanic_hours_available: mechanicHours,
        total_tasks: formattedTasks.length,
        selected_tasks: optimizationResult.selectedTasks,
        total_impact: optimizationResult.totalImpact,
        total_duration: optimizationResult.totalDuration,
        unused_hours: optimizationResult.unusedHours
      }
    };

    Log('backend', 'info', 'controller', 'Returning optimization result');

    res.status(200).json(response);
  } catch (error) {
    Log('backend', 'error', 'controller', `Optimization failed: ${error.message}`);

    const responseTime = Date.now() - requestStartTime;

    res.status(500).json({
      success: false,
      response_time_ms: responseTime,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * Health check endpoint
 * Returns server status and timestamp
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getHealthStatus(req, res) {
  try {
    Log('backend', 'debug', 'controller', 'Health check requested');

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    Log('backend', 'error', 'controller', `Health check failed: ${error.message}`);

    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
}

// Export controller functions
module.exports = {
  getOptimizedSchedule,
  getHealthStatus
};
