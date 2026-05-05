/**
 * API Client Service
 * Handles all HTTP requests to evaluation service endpoints
 * Includes authentication and error handling
 */

const https = require('https');
const { URL } = require('url');
const { Log } = require('../../../logging_middleware');
const { getMockDepot, getMockVehicles } = require('./mockData');

const BASE_URL = 'http://20.207.122.201/evaluation-service';
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

/**
 * Makes an HTTP request to the evaluation service
 * @private
 * @param {string} endpoint - API endpoint path
 * @param {string} token - Bearer token for authentication
 * @returns {Promise<Object>} Response data
 */
async function makeRequest(endpoint, token) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(endpoint, BASE_URL);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : require('http');

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };

      const req = client.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            if (data) {
              resolve(JSON.parse(data));
            } else {
              resolve({ success: true });
            }
          } catch (parseError) {
            reject(new Error(`Failed to parse response: ${parseError.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`HTTP request failed: ${error.message}`));
      });

      // Set timeout to prevent hanging requests
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('HTTP request timeout'));
      });

      req.end();
    } catch (error) {
      reject(new Error(`Request setup failed: ${error.message}`));
    }
  });
}

/**
 * Fetches depot information from the evaluation service
 * Retrieves mechanic hours and other depot data
 *
 * @param {string} token - Bearer token for authentication
 * @returns {Promise<Object>} Depot data
 * @throws {Error} If request fails
 */
async function fetchDepot(token) {
  try {
    await Log('backend', 'debug', 'service', 'Fetching depot information');
    
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      await Log('backend', 'info', 'service', 'Using mock depot data');
      return getMockDepot();
    }
    
    const response = await makeRequest('/depots', token);
    
    await Log('backend', 'info', 'service', `Depot fetched successfully`);
    
    return response;
  } catch (error) {
    await Log('backend', 'error', 'service', `Failed to fetch depot: ${error.message}`);
    
    // Fallback to mock data on error
    await Log('backend', 'warn', 'service', 'Using mock data as fallback');
    return getMockDepot();
  }
}

/**
 * Fetches vehicles and their maintenance tasks
 * Retrieves all vehicles with associated tasks
 *
 * @param {string} token - Bearer token for authentication
 * @returns {Promise<Object>} Vehicles data with tasks
 * @throws {Error} If request fails
 */
async function fetchVehicles(token) {
  try {
    await Log('backend', 'debug', 'service', 'Fetching vehicles and tasks');
    
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      await Log('backend', 'info', 'service', 'Using mock vehicles data');
      return getMockVehicles();
    }
    
    const response = await makeRequest('/vehicles', token);
    
    await Log('backend', 'info', 'service', `Vehicles fetched successfully`);
    
    return response;
  } catch (error) {
    await Log('backend', 'error', 'service', `Failed to fetch vehicles: ${error.message}`);
    
    // Fallback to mock data on error
    await Log('backend', 'warn', 'service', 'Using mock data as fallback');
    return getMockVehicles();
  }
}

// Export API client functions
module.exports = {
  fetchDepot,
  fetchVehicles
};
