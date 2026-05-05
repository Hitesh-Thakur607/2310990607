/**
 * Knapsack Solver
 * Implements 0/1 Knapsack Problem using Dynamic Programming
 * Maximizes impact while staying within time constraints
 * 
 * Time Complexity: O(n * maxHours)
 * Space Complexity: O(n * maxHours)
 */

const { Log } = require('../../../logging_middleware');

/**
 * Solves the 0/1 Knapsack problem to optimize maintenance task selection
 * Uses Dynamic Programming to find the maximum impact tasks that fit within available hours
 *
 * @param {Array<Object>} tasks - Array of tasks with {id, duration, impact}
 * @param {number} maxHours - Maximum available hours (knapsack capacity)
 * @returns {Object} {
 *   selectedTasks: Array of selected task objects,
 *   totalImpact: Total impact value,
 *   totalDuration: Total duration used,
 *   unusedHours: Remaining hours
 * }
 */
function solveKnapsack(tasks, maxHours) {
  try {
    // Validate inputs
    if (!Array.isArray(tasks) || tasks.length === 0) {
      Log('backend', 'warn', 'service', 'No tasks provided to knapsack solver');
      return {
        selectedTasks: [],
        totalImpact: 0,
        totalDuration: 0,
        unusedHours: maxHours
      };
    }

    if (typeof maxHours !== 'number' || maxHours <= 0) {
      Log('backend', 'warn', 'service', 'Invalid maxHours value');
      return {
        selectedTasks: [],
        totalImpact: 0,
        totalDuration: 0,
        unusedHours: maxHours
      };
    }

    Log('backend', 'debug', 'service', `Starting knapsack solver: ${tasks.length} tasks, ${maxHours} hours`);

    const n = tasks.length;
    const W = Math.floor(maxHours); // Capacity (hours must be integer)

    // Create DP table: dp[i][w] = max impact using first i items with w capacity
    // Initialize with zeros
    const dp = Array(n + 1).fill(null).map(() => Array(W + 1).fill(0));

    // Build the DP table
    for (let i = 1; i <= n; i++) {
      const currentTask = tasks[i - 1];
      const taskDuration = Math.ceil(currentTask.duration); // Round up duration
      const taskImpact = currentTask.impact;

      for (let w = 0; w <= W; w++) {
        // Option 1: Don't include this task
        dp[i][w] = dp[i - 1][w];

        // Option 2: Include this task (if it fits)
        if (taskDuration <= w) {
          const valueWithThisTask = taskImpact + dp[i - 1][w - taskDuration];
          
          // Take the maximum
          if (valueWithThisTask > dp[i][w]) {
            dp[i][w] = valueWithThisTask;
          }
        }
      }
    }

    // Backtrack to find which tasks were selected
    const selectedTasks = [];
    let remainingCapacity = W;
    let totalImpact = dp[n][W];

    for (let i = n; i > 0 && remainingCapacity > 0; i--) {
      // If value comes from including this task
      if (dp[i][remainingCapacity] !== dp[i - 1][remainingCapacity]) {
        const task = tasks[i - 1];
        const taskDuration = Math.ceil(task.duration);
        
        selectedTasks.push({
          taskId: task.id,
          duration: task.duration,
          impact: task.impact
        });
        
        remainingCapacity -= taskDuration;
      }
    }

    // Reverse to maintain original order
    selectedTasks.reverse();

    // Calculate actual total duration
    const totalDuration = selectedTasks.reduce((sum, task) => sum + task.duration, 0);
    const unusedHours = maxHours - totalDuration;

    Log('backend', 'info', 'service', `Knapsack solved: ${selectedTasks.length} tasks selected, impact: ${totalImpact}`);

    return {
      selectedTasks,
      totalImpact,
      totalDuration,
      unusedHours
    };
  } catch (error) {
    Log('backend', 'error', 'service', `Knapsack solver error: ${error.message}`);
    throw error;
  }
}

// Export solver function
module.exports = {
  solveKnapsack
};
