/**
 * Knapsack Solver Unit Test
 * Tests the 0/1 Knapsack DP algorithm independently
 */

const { solveKnapsack } = require('./src/services/knapsackSolver');

function runTests() {
  console.log('=== Knapsack Solver Unit Tests ===\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Basic example
  console.log('Test 1: Basic Example');
  const tasks1 = [
    { id: 'T1', duration: 5, impact: 10 },
    { id: 'T2', duration: 4, impact: 8 },
    { id: 'T3', duration: 3, impact: 6 }
  ];
  const result1 = solveKnapsack(tasks1, 10);
  
  console.log('Input:');
  console.log('- Tasks:', tasks1);
  console.log('- Capacity: 10 hours');
  console.log('\nOutput:');
  console.log('- Selected:', result1.selectedTasks.map(t => t.taskId));
  console.log('- Total Impact:', result1.totalImpact);
  console.log('- Total Duration:', result1.totalDuration);
  console.log('- Unused Hours:', result1.unusedHours);
  
  if (result1.totalDuration <= 10 && result1.selectedTasks.length > 0) {
    console.log('✓ PASS\n');
    passed++;
  } else {
    console.log('✗ FAIL\n');
    failed++;
  }

  // Test 2: All tasks fit
  console.log('Test 2: All Tasks Fit');
  const tasks2 = [
    { id: 'T1', duration: 2, impact: 5 },
    { id: 'T2', duration: 2, impact: 5 }
  ];
  const result2 = solveKnapsack(tasks2, 10);
  
  console.log('Input:');
  console.log('- Tasks:', tasks2);
  console.log('- Capacity: 10 hours');
  console.log('\nOutput:');
  console.log('- Selected:', result2.selectedTasks.map(t => t.taskId));
  console.log('- Total Tasks Selected:', result2.selectedTasks.length);
  
  if (result2.selectedTasks.length === 2) {
    console.log('✓ PASS\n');
    passed++;
  } else {
    console.log('✗ FAIL\n');
    failed++;
  }

  // Test 3: No tasks fit
  console.log('Test 3: Tasks Too Long');
  const tasks3 = [
    { id: 'T1', duration: 20, impact: 50 },
    { id: 'T2', duration: 15, impact: 40 }
  ];
  const result3 = solveKnapsack(tasks3, 10);
  
  console.log('Input:');
  console.log('- Tasks:', tasks3);
  console.log('- Capacity: 10 hours');
  console.log('\nOutput:');
  console.log('- Selected:', result3.selectedTasks.map(t => t.taskId));
  console.log('- Total Selected:', result3.selectedTasks.length);
  
  if (result3.selectedTasks.length === 0) {
    console.log('✓ PASS\n');
    passed++;
  } else {
    console.log('✗ FAIL\n');
    failed++;
  }

  // Test 4: Complex example
  console.log('Test 4: Complex Example (10 tasks, 40 hours)');
  const tasks4 = [
    { id: 'T1', duration: 5.5, impact: 10 },
    { id: 'T2', duration: 3.2, impact: 8 },
    { id: 'T3', duration: 4.0, impact: 7 },
    { id: 'T4', duration: 6.0, impact: 12 },
    { id: 'T5', duration: 2.5, impact: 5 },
    { id: 'T6', duration: 3.8, impact: 9 },
    { id: 'T7', duration: 5.0, impact: 11 },
    { id: 'T8', duration: 2.0, impact: 4 },
    { id: 'T9', duration: 4.2, impact: 6 },
    { id: 'T10', duration: 3.5, impact: 8 }
  ];
  const result4 = solveKnapsack(tasks4, 40);
  
  console.log('Input:');
  console.log(`- Tasks: ${tasks4.length} tasks`);
  console.log('- Capacity: 40 hours');
  console.log('\nOutput:');
  console.log('- Selected Tasks:', result4.selectedTasks.length);
  console.log('- Total Impact:', result4.totalImpact);
  console.log('- Total Duration:', result4.totalDuration.toFixed(2));
  console.log('- Unused Hours:', result4.unusedHours.toFixed(2));
  console.log('- Selected:', result4.selectedTasks.map(t => t.taskId).join(', '));
  
  if (result4.totalDuration <= 40 && result4.totalImpact > 0) {
    console.log('✓ PASS\n');
    passed++;
  } else {
    console.log('✗ FAIL\n');
    failed++;
  }

  // Test 5: Empty tasks
  console.log('Test 5: Empty Tasks Array');
  const result5 = solveKnapsack([], 10);
  
  console.log('Input: Empty array');
  console.log('\nOutput:');
  console.log('- Selected:', result5.selectedTasks.length);
  console.log('- Total Impact:', result5.totalImpact);
  
  if (result5.selectedTasks.length === 0 && result5.totalImpact === 0) {
    console.log('✓ PASS\n');
    passed++;
  } else {
    console.log('✗ FAIL\n');
    failed++;
  }

  // Test 6: Single task
  console.log('Test 6: Single Task');
  const tasks6 = [
    { id: 'T1', duration: 5, impact: 15 }
  ];
  const result6 = solveKnapsack(tasks6, 10);
  
  console.log('Input:');
  console.log('- Tasks:', tasks6);
  console.log('- Capacity: 10 hours');
  console.log('\nOutput:');
  console.log('- Selected:', result6.selectedTasks.map(t => t.taskId));
  console.log('- Total Impact:', result6.totalImpact);
  
  if (result6.totalImpact === 15) {
    console.log('✓ PASS\n');
    passed++;
  } else {
    console.log('✗ FAIL\n');
    failed++;
  }

  // Summary
  console.log('=== Test Summary ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n✓ All tests passed!');
    process.exit(0);
  } else {
    console.log(`\n✗ ${failed} test(s) failed`);
    process.exit(1);
  }
}

// Run tests
runTests();
