/**
 * Real Token Test - Uses your actual JWT token from .env file
 */

const fs = require('fs');
const path = require('path');
const { setAuthToken, Log } = require('./index');

/**
 * Simple .env file parser (no external dependencies)
 */
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.error('Please create a .env file with AUTH_TOKEN');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('AUTH_TOKEN=')) {
      const token = line.replace('AUTH_TOKEN=', '').trim();
      return token;
    }
  }

  console.error('❌ AUTH_TOKEN not found in .env file!');
  process.exit(1);
}

async function testWithRealToken() {
  console.log('=== Testing Logger with Real Token from .env ===\n');

  // Load token from .env file
  const token = loadEnv();
  console.log('✓ Token loaded from .env file\n');

  console.log('Token Info:');
  console.log('- User: hitesh thakur');
  console.log('- Email: hitesh0607.be23@chitkara.edu.in');
  console.log('- Roll No: 23109906007');
  console.log('- Access Code: EXfvDp\n');

  // Set the token
  setAuthToken(token);

  // Test 1: Send info log
  console.log('Test 1: Sending INFO log...');
  const log1 = await Log('backend', 'info', 'service', 'Test log from logging middleware');
  console.log('Result:', log1 ? `✓ Success! LogID: ${log1}` : '✗ Failed to send log\n');

  // Test 2: Send debug log
  console.log('\nTest 2: Sending DEBUG log...');
  const log2 = await Log('backend', 'debug', 'handler', 'Debug information for testing');
  console.log('Result:', log2 ? `✓ Success! LogID: ${log2}` : '✗ Failed to send log\n');

  // Test 3: Send error log
  console.log('\nTest 3: Sending ERROR log...');
  const log3 = await Log('backend', 'error', 'controller', 'Test error log');
  console.log('Result:', log3 ? `✓ Success! LogID: ${log3}` : '✗ Failed to send log\n');

  // Test 4: Send frontend log
  console.log('\nTest 4: Sending FRONTEND log...');
  const log4 = await Log('frontend', 'info', 'component', 'Test component log');
  console.log('Result:', log4 ? `✓ Success! LogID: ${log4}` : '✗ Failed to send log\n');

  console.log('=== Test Complete ===');
}

// Run the test
testWithRealToken().catch(console.error);
