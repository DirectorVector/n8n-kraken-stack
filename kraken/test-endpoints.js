const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3240';
const TEST_PAIRS = ['XXBTZUSD', 'XETHZUSD', 'ADAUSD'];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class KrakenAPITester {
  constructor() {
    this.passedTests = 0;
    this.failedTests = 0;
    this.results = [];
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async testEndpoint(method, endpoint, data = null, description = '') {
    try {
      this.log(`\n${colors.bold}Testing: ${description || endpoint}${colors.reset}`);
      this.log(`${method.toUpperCase()} ${BASE_URL}${endpoint}`, 'cyan');

      const config = {
        method: method.toLowerCase(),
        url: `${BASE_URL}${endpoint}`,
        timeout: 10000
      };

      if (data && method.toLowerCase() === 'post') {
        config.data = data;
        config.headers = { 'Content-Type': 'application/json' };
        this.log(`Request body: ${JSON.stringify(data, null, 2)}`, 'yellow');
      }

      const response = await axios(config);
      
      if (response.status === 200) {
        this.log(`✅ SUCCESS (${response.status})`, 'green');
        if (response.data.error && response.data.error.length > 0) {
          this.log(`⚠️  API returned errors: ${JSON.stringify(response.data.error)}`, 'yellow');
        } else {
          this.log(`📊 Response keys: ${Object.keys(response.data.result || response.data).join(', ')}`, 'blue');
        }
        this.passedTests++;
        this.results.push({ endpoint, method, status: 'PASS', response: response.status });
        return true;
      } else {
        this.log(`❌ UNEXPECTED STATUS: ${response.status}`, 'red');
        this.failedTests++;
        this.results.push({ endpoint, method, status: 'FAIL', response: response.status });
        return false;
      }
    } catch (error) {
      if (error.response) {
        this.log(`❌ HTTP ERROR: ${error.response.status}`, 'red');
        this.log(`Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
        this.results.push({ endpoint, method, status: 'FAIL', response: error.response.status, error: error.response.data });
      } else {
        this.log(`❌ REQUEST ERROR: ${error.message}`, 'red');
        this.results.push({ endpoint, method, status: 'FAIL', error: error.message });
      }
      this.failedTests++;
      return false;
    }
  }

  async runAllTests() {
    this.log(`\n${colors.bold}🧪 Kraken API Endpoint Testing Suite${colors.reset}`, 'cyan');
    this.log(`Target: ${BASE_URL}`, 'blue');
    this.log(`Test pairs: ${TEST_PAIRS.join(', ')}`, 'blue');

    // Health check
    await this.testEndpoint('GET', '/health', null, 'Health Check');

    // Server time
    await this.testEndpoint('GET', '/api/time', null, 'Server Time');

    // Market Data Endpoints (Public - Safe to test)
    this.log(`\n${colors.bold}=== MARKET DATA ENDPOINTS ===${colors.reset}`, 'cyan');
    
    await this.testEndpoint('GET', '/api/system-status', null, 'System Status');
    await this.testEndpoint('GET', '/api/assets', null, 'All Assets');
    await this.testEndpoint('GET', '/api/assets?asset=XBT,ETH', null, 'Specific Assets (XBT,ETH)');
    await this.testEndpoint('GET', '/api/asset-pairs', null, 'All Asset Pairs');
    await this.testEndpoint('GET', '/api/asset-pairs?pair=XXBTZUSD,XETHZUSD', null, 'Specific Asset Pairs');

    // Test ticker for each test pair
    for (const pair of TEST_PAIRS) {
      await this.testEndpoint('GET', `/api/ticker?pair=${pair}`, null, `Ticker for ${pair}`);
    }

    // Test OHLC data
    for (const pair of TEST_PAIRS.slice(0, 2)) { // Test first 2 pairs to save time
      await this.testEndpoint('GET', `/api/ohlc?pair=${pair}&interval=60`, null, `OHLC for ${pair} (1h)`);
    }

    // Test order book depth
    for (const pair of TEST_PAIRS.slice(0, 2)) {
      await this.testEndpoint('GET', `/api/depth?pair=${pair}&count=5`, null, `Order Book for ${pair} (top 5)`);
    }

    // Test recent trades
    await this.testEndpoint('GET', `/api/trades?pair=${TEST_PAIRS[0]}`, null, `Recent Trades for ${TEST_PAIRS[0]}`);

    // Test spread data
    await this.testEndpoint('GET', `/api/spread?pair=${TEST_PAIRS[0]}`, null, `Spread Data for ${TEST_PAIRS[0]}`);

    // Parameter Validation Tests
    this.log(`\n${colors.bold}=== PARAMETER VALIDATION TESTS ===${colors.reset}`, 'cyan');
    
    // Test missing required parameters (should fail with 400)
    try {
      await axios.get(`${BASE_URL}/api/ticker`);
      this.log(`❌ VALIDATION FAILED: ticker without pair should return 400`, 'red');
      this.failedTests++;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        this.log(`✅ VALIDATION PASSED: ticker without pair correctly returns 400`, 'green');
        this.passedTests++;
      } else {
        this.log(`❌ VALIDATION FAILED: unexpected error for ticker without pair`, 'red');
        this.failedTests++;
      }
    }

    // Private Endpoint Tests (Will show authentication errors - this is expected)
    this.log(`\n${colors.bold}=== PRIVATE ENDPOINT TESTS (Expected Auth Errors) ===${colors.reset}`, 'cyan');
    
    await this.testEndpoint('GET', '/api/balance', null, 'Account Balance (expect auth error)');

    // Trading Endpoint Validation Tests (Safe - using validate=true)
    this.log(`\n${colors.bold}=== TRADING ENDPOINT VALIDATION TESTS ===${colors.reset}`, 'cyan');
    
    // Test add-order with validation only (safe)
    const validOrderData = {
      pair: 'XXBTZUSD',
      type: 'buy',
      ordertype: 'limit',
      volume: '0.001',
      price: '30000',
      validate: true // This makes it safe - only validates, doesn't execute
    };
    await this.testEndpoint('POST', '/api/add-order', validOrderData, 'Add Order (validation only)');

    // Test missing parameters for add-order
    await this.testEndpoint('POST', '/api/add-order', {}, 'Add Order (missing params - should fail)');

    // Test cancel-order with missing txid
    await this.testEndpoint('POST', '/api/cancel-order', {}, 'Cancel Order (missing txid - should fail)');

    // Test cancel-all-orders-after with invalid timeout
    await this.testEndpoint('POST', '/api/cancel-all-orders-after', { timeout: 99999 }, 'Cancel All After (invalid timeout - should fail)');

    // Test cancel-all-orders-after with valid timeout (0 = disable)
    await this.testEndpoint('POST', '/api/cancel-all-orders-after', { timeout: 0 }, 'Cancel All After (disable timer)');

    // Summary
    this.printSummary();
  }

  printSummary() {
    this.log(`\n${colors.bold}=== TEST SUMMARY ===${colors.reset}`, 'cyan');
    this.log(`✅ Passed: ${this.passedTests}`, 'green');
    this.log(`❌ Failed: ${this.failedTests}`, 'red');
    this.log(`📊 Total: ${this.passedTests + this.failedTests}`, 'blue');
    
    const successRate = ((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1);
    this.log(`📈 Success Rate: ${successRate}%`, successRate > 80 ? 'green' : 'yellow');

    if (this.failedTests > 0) {
      this.log(`\n${colors.bold}Failed Tests:${colors.reset}`, 'red');
      this.results.filter(r => r.status === 'FAIL').forEach(result => {
        this.log(`  ❌ ${result.method} ${result.endpoint}`, 'red');
      });
    }

    this.log(`\n${colors.bold}🏁 Testing completed!${colors.reset}`, 'cyan');
  }
}

// Error handling for axios
axios.defaults.timeout = 10000;

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new KrakenAPITester();
  
  // Check if server is running first
  axios.get(`${BASE_URL}/health`)
    .then(() => {
      console.log(`${colors.green}✅ Server is running at ${BASE_URL}${colors.reset}`);
      return tester.runAllTests();
    })
    .catch((error) => {
      console.log(`${colors.red}❌ Cannot connect to server at ${BASE_URL}${colors.reset}`);
      console.log(`${colors.red}Please make sure the Kraken API service is running.${colors.reset}`);
      console.log(`${colors.yellow}Run: docker-compose up kraken${colors.reset}`);
      process.exit(1);
    });
}

module.exports = KrakenAPITester;
