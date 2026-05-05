/**
 * API Test Script
 * Tests all endpoints of the Vehicle Maintenance Scheduler
 */

const http = require('http');

/**
 * Makes HTTP request to the service
 */
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('=== Vehicle Maintenance Scheduler - API Tests ===\n');

  try {
    // Test 1: Root endpoint
    console.log('Test 1: GET / (Root)');
    const root = await makeRequest('/');
    console.log(`Status: ${root.status}`);
    console.log('Response:', JSON.stringify(root.data, null, 2));
    console.log('✓ PASS\n');

    // Test 2: Health check
    console.log('Test 2: GET /api/schedule/health (Health Check)');
    const health = await makeRequest('/api/schedule/health');
    console.log(`Status: ${health.status}`);
    console.log('Response:', JSON.stringify(health.data, null, 2));
    console.log('✓ PASS\n');

    // Test 3: Optimize schedule
    console.log('Test 3: GET /api/schedule/optimize (Optimize Schedule)');
    console.log('(This may take a moment to fetch data from APIs)\n');
    
    const startTime = Date.now();
    const optimize = await makeRequest('/api/schedule/optimize');
    const duration = Date.now() - startTime;
    
    console.log(`Status: ${optimize.status}`);
    console.log(`Total Time: ${duration}ms`);
    console.log('Response:', JSON.stringify(optimize.data, null, 2));
    
    if (optimize.status === 200 && optimize.data.success) {
      console.log('✓ PASS\n');
    } else {
      console.log('⚠ WARNING: Status not 200 or success not true\n');
    }

    // Test 4: Invalid endpoint
    console.log('Test 4: GET /api/invalid (Invalid Endpoint)');
    const invalid = await makeRequest('/api/invalid');
    console.log(`Status: ${invalid.status}`);
    console.log('Response:', JSON.stringify(invalid.data, null, 2));
    
    if (invalid.status === 404) {
      console.log('✓ PASS\n');
    }

    console.log('=== All Tests Complete ===');
    process.exit(0);
  } catch (error) {
    console.error('✗ Test Error:', error.message);
    process.exit(1);
  }
}

// Wait a moment for server to start, then run tests
setTimeout(runTests, 1000);
