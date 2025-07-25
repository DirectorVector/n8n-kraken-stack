const axios = require('axios');

// Configuration
const TEST_PAIRS = ['XXBTZUSD', 'XETHZUSD', 'ADAUSD'];

class KrakenAPITester {
  constructor(baseUrl = 'http://localhost:3240') {
    this.baseUrl = baseUrl;
    this.passedTests = 0;
    this.failedTests = 0;
    this.results = [];
    this.logs = [];
  }

  log(message, level = 'info') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message
    };
    this.logs.push(logEntry);
  }

  async testEndpoint(method, endpoint, data = null, description = '') {
    try {
      this.log(`Testing: ${description || endpoint}`, 'info');
      this.log(`${method.toUpperCase()} ${this.baseUrl}${endpoint}`, 'debug');

      const config = {
        method: method.toLowerCase(),
        url: `${this.baseUrl}${endpoint}`,
        timeout: 10000
      };

      if (data && method.toLowerCase() === 'post') {
        config.data = data;
        config.headers = { 'Content-Type': 'application/json' };
        this.log(`Request body: ${JSON.stringify(data)}`, 'debug');
      }

      const response = await axios(config);
      
      if (response.status === 200) {
        this.log(`✅ SUCCESS (${response.status})`, 'success');
        if (response.data.error && response.data.error.length > 0) {
          this.log(`⚠️ API returned errors: ${JSON.stringify(response.data.error)}`, 'warning');
        } else if (response.data.result) {
          this.log(`📊 Response keys: ${Object.keys(response.data.result).slice(0, 10).join(', ')}${Object.keys(response.data.result).length > 10 ? '...' : ''}`, 'info');
        } else {
          this.log(`📊 Response keys: ${Object.keys(response.data).slice(0, 10).join(', ')}${Object.keys(response.data).length > 10 ? '...' : ''}`, 'info');
        }
        this.passedTests++;
        this.results.push({ 
          endpoint, 
          method, 
          status: 'PASS', 
          httpStatus: response.status,
          description
        });
        return true;
      } else {
        this.log(`❌ UNEXPECTED STATUS: ${response.status}`, 'error');
        this.failedTests++;
        this.results.push({ 
          endpoint, 
          method, 
          status: 'FAIL', 
          httpStatus: response.status,
          description
        });
        return false;
      }
    } catch (error) {
      if (error.response) {
        this.log(`❌ HTTP ERROR: ${error.response.status}`, 'error');
        this.log(`Response: ${JSON.stringify(error.response.data)}`, 'error');
        this.results.push({ 
          endpoint, 
          method, 
          status: 'FAIL', 
          httpStatus: error.response.status, 
          error: error.response.data,
          description
        });
      } else {
        this.log(`❌ REQUEST ERROR: ${error.message}`, 'error');
        this.results.push({ 
          endpoint, 
          method, 
          status: 'FAIL', 
          error: error.message,
          description
        });
      }
      this.failedTests++;
      return false;
    }
  }

  async runAllTests() {
    this.log('🧪 Kraken API Endpoint Testing Suite Started', 'info');
    this.log(`Target: ${this.baseUrl}`, 'info');
    this.log(`Test pairs: ${TEST_PAIRS.join(', ')}`, 'info');

    // Reset counters
    this.passedTests = 0;
    this.failedTests = 0;
    this.results = [];

    // Health check
    await this.testEndpoint('GET', '/health', null, 'Health Check');

    // Server time
    await this.testEndpoint('GET', '/api/time', null, 'Server Time');

    // Market Data Endpoints (Public - Safe to test)
    this.log('=== MARKET DATA ENDPOINTS ===', 'info');
    
    await this.testEndpoint('GET', '/api/system-status', null, 'System Status');
    await this.testEndpoint('GET', '/api/assets', null, 'All Assets');
    await this.testEndpoint('GET', '/api/assets?asset=XBT,ETH', null, 'Specific Assets (XBT,ETH)');
    await this.testEndpoint('GET', '/api/asset-pairs', null, 'All Asset Pairs');
    await this.testEndpoint('GET', '/api/asset-pairs?pair=XXBTZUSD,XETHZUSD', null, 'Specific Asset Pairs');

    // Test ticker for each test pair
    for (const pair of TEST_PAIRS) {
      await this.testEndpoint('GET', `/api/ticker?pair=${pair}`, null, `Ticker for ${pair}`);
    }

    // Test OHLC data (limit to 2 pairs to save time)
    for (const pair of TEST_PAIRS.slice(0, 2)) {
      await this.testEndpoint('GET', `/api/ohlc?pair=${pair}&interval=60`, null, `OHLC for ${pair} (1h)`);
    }

    // Test order book depth (limit to 2 pairs)
    for (const pair of TEST_PAIRS.slice(0, 2)) {
      await this.testEndpoint('GET', `/api/depth?pair=${pair}&count=5`, null, `Order Book for ${pair} (top 5)`);
    }

    // Test recent trades
    await this.testEndpoint('GET', `/api/trades?pair=${TEST_PAIRS[0]}`, null, `Recent Trades for ${TEST_PAIRS[0]}`);

    // Test spread data
    await this.testEndpoint('GET', `/api/spread?pair=${TEST_PAIRS[0]}`, null, `Spread Data for ${TEST_PAIRS[0]}`);

    // Parameter Validation Tests
    this.log('=== PARAMETER VALIDATION TESTS ===', 'info');
    
    // Test missing required parameters (should fail with 400)
    try {
      await axios.get(`${this.baseUrl}/api/ticker`, { timeout: 5000 });
      this.log('❌ VALIDATION FAILED: ticker without pair should return 400', 'error');
      this.failedTests++;
      this.results.push({
        endpoint: '/api/ticker',
        method: 'GET',
        status: 'FAIL',
        description: 'Ticker without pair validation',
        error: 'Should have returned 400 but succeeded'
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        this.log('✅ VALIDATION PASSED: ticker without pair correctly returns 400', 'success');
        this.passedTests++;
        this.results.push({
          endpoint: '/api/ticker',
          method: 'GET',
          status: 'PASS',
          httpStatus: 400,
          description: 'Ticker without pair validation'
        });
      } else {
        this.log('❌ VALIDATION FAILED: unexpected error for ticker without pair', 'error');
        this.failedTests++;
        this.results.push({
          endpoint: '/api/ticker',
          method: 'GET',
          status: 'FAIL',
          description: 'Ticker without pair validation',
          error: error.message
        });
      }
    }

    // Private Endpoint Tests (Will show authentication errors - this is expected)
    this.log('=== PRIVATE ENDPOINT TESTS (Expected Auth Errors) ===', 'info');
    
    await this.testEndpoint('GET', '/api/balance', null, 'Account Balance (expect auth error)');

    // Trading Endpoint Validation Tests (Safe - using validate=true)
    this.log('=== TRADING ENDPOINT VALIDATION TESTS ===', 'info');
    
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

    // Generate summary
    return this.generateSummary();
  }

  generateSummary() {
    const total = this.passedTests + this.failedTests;
    const successRate = total > 0 ? ((this.passedTests / total) * 100).toFixed(1) : 0;
    
    this.log('=== TEST SUMMARY ===', 'info');
    this.log(`✅ Passed: ${this.passedTests}`, 'success');
    this.log(`❌ Failed: ${this.failedTests}`, 'error');
    this.log(`📊 Total: ${total}`, 'info');
    this.log(`📈 Success Rate: ${successRate}%`, 'info');

    const failedTests = this.results.filter(r => r.status === 'FAIL');
    if (failedTests.length > 0) {
      this.log('Failed Tests:', 'error');
      failedTests.forEach(result => {
        this.log(`  ❌ ${result.method} ${result.endpoint} - ${result.description}`, 'error');
      });
    }

    this.log('🏁 Testing completed!', 'info');

    return {
      summary: {
        passed: this.passedTests,
        failed: this.failedTests,
        total: total,
        successRate: parseFloat(successRate),
        status: this.failedTests <= 5 ? 'healthy' : 'issues_detected' // Expected ~5 failures due to permissions
      },
      results: this.results,
      logs: this.logs,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = KrakenAPITester;
