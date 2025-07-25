# Kraken API Service Testing Guide

## Overview

This document describes the comprehensive testing suite for the Kraken API service. The test suite validates all endpoints that can be safely executed without actual trading or purchasing.

## Test Categories

### ✅ **Safe Tests** (Automatically Executed)
These tests can be run safely without any risk of actual trading or financial transactions:

#### 1. **Market Data Endpoints** (Public - No Authentication)
- ✅ System Status
- ✅ Assets (all and specific)
- ✅ Asset Pairs (all and specific)
- ✅ Ticker Data (for multiple pairs)
- ✅ OHLC Data (candlestick data)
- ✅ Order Book Depth
- ✅ Recent Trades
- ✅ Spread Data

#### 2. **Parameter Validation Tests**
- ✅ Missing required parameters (should return 400 errors)
- ✅ Invalid parameter values (should return validation errors)
- ✅ Timeout range validation

#### 3. **Authentication Tests**
- ✅ Private endpoints with API credentials
- ✅ Permission denied scenarios (expected for trading endpoints)

### ⚠️ **Trading Endpoint Tests** (Validation Only)
These tests use the `validate=true` parameter which only validates the order without executing it:

- ✅ Add Order (with validate=true) - **SAFE** validation only
- ✅ Parameter validation for all trading endpoints
- ✅ Missing parameter detection

### 🚫 **Excluded Tests** (Not Safe to Automate)
These operations are NOT included in automated testing as they would execute real trades:

- ❌ Add Order (without validate=true)
- ❌ Cancel Order (with real order IDs)
- ❌ Cancel All Orders (would cancel real orders)

## Running Tests

### Prerequisites
1. Kraken API service must be running on port 3240
2. Valid Kraken API credentials configured in environment

### HTTP Test Endpoint (Recommended)

The easiest way to run tests is through the built-in HTTP endpoint:

```bash
# Quick summary (returns JSON with just the summary stats)
curl http://localhost:3240/test?format=summary

# Full results (returns complete test data including logs)
curl http://localhost:3240/test

# HTML dashboard (opens beautiful test results in browser)
curl http://localhost:3240/test?format=html
# or visit: http://localhost:3240/test?format=html
```

**HTTP Endpoint Features**:
- ✅ **Multiple Output Formats**: JSON, summary, HTML
- ✅ **Browser Dashboard**: Rich HTML interface with color-coded results
- ✅ **Real-Time Execution**: Tests run live when endpoint is called
- ✅ **Integration Ready**: Perfect for monitoring systems
- ✅ **No External Tools**: Runs within existing service
- ✅ **Timeout Protection**: Configurable timeout prevents hanging

**Query Parameters**:
- `format=json` (default): Full test results with logs
- `format=summary`: Just the summary statistics
- `format=html`: Beautiful HTML dashboard
- `timeout=30000`: Timeout in milliseconds (default: 30 seconds)

### Command Line Testing

```bash
# Run the full test suite
npm test

# Run tests with auto-restart on changes
npm run test:watch

# Manual execution
node test-endpoints.js
```

### Expected Results

#### Successful Test Output
```
✅ Passed: 18-20 tests
❌ Failed: 3-5 tests (expected permission errors)
📈 Success Rate: 75-85%
```

#### Expected "Failures" (These are actually correct behaviors)
1. **Trading endpoints returning permission errors** - Expected if API key doesn't have trading permissions
2. **Parameter validation returning 400 errors** - Expected for missing/invalid parameters
3. **Authentication errors** - Expected for misconfigured API credentials

## Test Results Interpretation

### 🟢 **Green Results** (Expected Success)
- All market data endpoints return 200 status
- Parameter validation correctly rejects invalid inputs
- Server responds to health checks

### 🟡 **Yellow Results** (Expected "Failures")
- Trading endpoints return "Permission denied" (normal if API key lacks trading permissions)
- Validation tests return 400 errors (correct behavior for invalid inputs)

### 🔴 **Red Results** (Actual Problems)
- Market data endpoints returning 500 errors
- Server not responding to health checks
- Unexpected authentication failures

## Test Configuration

### Customizable Settings
```javascript
// In test-endpoints.js
const BASE_URL = 'http://localhost:3240';  // API service URL
const TEST_PAIRS = ['XXBTZUSD', 'XETHZUSD', 'ADAUSD'];  // Trading pairs to test
```

### Environment Requirements
```bash
# Required environment variables
KRAKEN_API_KEY=your_api_key
KRAKEN_API_SECRET=your_api_secret
```

## Safety Features

### Built-in Safeguards
1. **No Real Trading** - All trading operations use `validate=true` or test invalid parameters
2. **Read-Only Operations** - Market data endpoints are completely safe
3. **Permission Checks** - Tests verify authentication without executing sensitive operations
4. **Timeout Protection** - All requests have 10-second timeout limits

### Test Isolation
- Tests don't modify any real data
- No orders are placed on the exchange
- All operations are read-only or validation-only

## Troubleshooting

### Common Issues

#### "Server not running" Error
```bash
# Solution: Start the Kraken service
docker-compose up kraken
```

#### Permission Denied Errors
This is **expected behavior** for trading endpoints if your API key doesn't have trading permissions. The tests are designed to validate the authentication flow.

#### High "Failure" Count
If you see 3-5 "failed" tests, this is normal. These are typically:
- Permission denied for trading endpoints (expected)
- Parameter validation errors (expected)
- Missing required parameters (expected)

### API Rate Limiting
The test suite includes reasonable delays and targets only essential endpoints to avoid hitting Kraken's rate limits.

## Adding New Tests

### Template for New Endpoint Test
```javascript
await this.testEndpoint(
  'GET',                          // HTTP method
  '/api/your-endpoint',           // Endpoint path
  null,                          // Request data (for POST)
  'Your Endpoint Description'     // Test description
);
```

### Test Safety Checklist
Before adding new tests, ensure:
- [ ] No real financial transactions
- [ ] No order placements (unless using validate=true)
- [ ] No order cancellations with real order IDs
- [ ] Read-only or validation-only operations

## Performance Metrics

### Typical Test Duration
- Full test suite: 15-30 seconds
- Market data tests: 10-15 seconds
- Validation tests: 5-10 seconds

### Resource Usage
- Minimal CPU usage
- Low network bandwidth
- No persistent state changes

## Integration with CI/CD

The test suite is designed to be CI/CD friendly:
- Exit codes indicate overall test success/failure
- JSON output available for automated parsing
- No interactive prompts or user input required
- Safe for automated execution in any environment

### HTTP Endpoint Integration

The `/test` HTTP endpoint is perfect for monitoring and automation:

```bash
# Health check script example
HEALTH=$(curl -s http://localhost:3240/test?format=summary | jq '.status')
if [ "$HEALTH" != "\"healthy\"" ]; then
  echo "API tests failing!"
  exit 1
fi

# Monitoring integration
curl -s http://localhost:3240/test?format=summary | \
  jq '{status: .status, passed: .passed, failed: .failed, success_rate: .successRate}'

# Get detailed failure information
curl -s http://localhost:3240/test | \
  jq '.results[] | select(.status == "FAIL") | {endpoint: .endpoint, error: .error}'
```

**Response Formats**:

*Summary Format (`?format=summary`)*:
```json
{
  "passed": 18,
  "failed": 5,
  "total": 23,
  "successRate": 78.3,
  "status": "healthy"
}
```

*Full Format (default)*:
```json
{
  "summary": { /* summary data */ },
  "results": [ /* individual test results */ ],
  "logs": [ /* detailed execution logs */ ],
  "timestamp": "2025-07-24T21:49:23.000Z"
}
```

## Security Considerations

### API Key Safety
- Tests never expose API keys in output
- Authentication errors are caught and handled gracefully
- No sensitive data is logged or transmitted unnecessarily

### Network Security
- All requests use HTTPS when applicable
- Timeout protection prevents hanging connections
- No credential storage in test files
