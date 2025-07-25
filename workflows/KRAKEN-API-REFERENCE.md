# n8n Workflow Kraken API Reference

Quick reference for using the Kraken API service within n8n workflows.

## 🔗 Internal Endpoints (Use in n8n Workflows)

**Base URL**: `http://kraken:3240`

### Health & System
```
GET http://kraken:3240/health
GET http://kraken:3240/system-status
GET http://kraken:3240/server-time
```

### Market Data
```
GET http://kraken:3240/assets
GET http://kraken:3240/asset-pairs
GET http://kraken:3240/ticker?pair=XBTUSD,ETHUSD
GET http://kraken:3240/ohlc?pair=XBTUSD&interval=1440
GET http://kraken:3240/depth?pair=XBTUSD&count=10
GET http://kraken:3240/trades?pair=XBTUSD&since=1234567890
GET http://kraken:3240/spread?pair=XBTUSD&since=1234567890
```

### Account & Trading (Requires API Keys)
```
GET http://kraken:3240/balance
GET http://kraken:3240/trade-balance?asset=ZUSD
GET http://kraken:3240/open-orders
GET http://kraken:3240/closed-orders?trades=true

# Trading Operations (POST)
POST http://kraken:3240/add-order
POST http://kraken:3240/cancel-order
POST http://kraken:3240/cancel-all
POST http://kraken:3240/cancel-all-orders-after
```

### Testing
```
GET http://kraken:3240/test                    # All endpoints test
GET http://kraken:3240/test?format=summary     # Summary format
```

## 🎯 Example n8n HTTP Request Node Configuration

### Market Data Example
```json
{
  "method": "GET",
  "url": "http://kraken:3240/ticker",
  "qs": {
    "pair": "XBTUSD,ETHUSD"
  },
  "headers": {
    "Content-Type": "application/json"
  }
}
```

### Account Balance Example
```json
{
  "method": "GET", 
  "url": "http://kraken:3240/balance",
  "headers": {
    "Content-Type": "application/json"
  }
}
```

### Add Order Example (Validation Mode)
```json
{
  "method": "POST",
  "url": "http://kraken:3240/add-order",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "pair": "XXBTZUSD",
    "type": "buy",
    "ordertype": "limit",
    "volume": "0.001",
    "price": "30000",
    "validate": true
  }
}
```

### Cancel Order Example
```json
{
  "method": "POST",
  "url": "http://kraken:3240/cancel-order",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "txid": "OQCLML-BW3P3-BUCMWZ"
  }
}
```

### Cancel All Orders Example
```json
{
  "method": "POST",
  "url": "http://kraken:3240/cancel-all",
  "headers": {
    "Content-Type": "application/json"
  }
}
```

### Cancel All Orders After Timer Example
```json
{
  "method": "POST",
  "url": "http://kraken:3240/cancel-all-orders-after",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "timeout": 60
  }
}
```

## 🔍 Response Format

All endpoints return JSON with this structure:
```json
{
  "success": true,
  "data": { /* API response */ },
  "timestamp": "2025-07-24T22:05:59.123Z",
  "endpoint": "/ticker"
}
```

## � Trading Endpoint Parameters

### POST /add-order
**Required:**
- `pair`: Asset pair (e.g., "XXBTZUSD")
- `type`: Order type ("buy" or "sell")
- `ordertype`: Order type ("market", "limit", "stop-loss", etc.)
- `volume`: Order volume in base asset

**Optional:**
- `price`: Price for limit orders
- `price2`: Secondary price for stop orders
- `leverage`: Leverage ratio
- `oflags`: Order flags (viqc, fcib, fciq, nompp, post)
- `starttm`: Scheduled start time
- `expiretm`: Expiration time
- `userref`: User reference ID
- `validate`: Validate inputs only (true/false)

### POST /cancel-order
**Required:**
- `txid`: Transaction ID of the order to cancel

### POST /cancel-all
No parameters required - cancels all open orders.

### POST /cancel-all-orders-after
**Required:**
- `timeout`: Timeout in seconds (0-86400, 0 disables timer)

## �🚨 Error Handling

Failed requests return:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details",
  "timestamp": "2025-07-24T22:05:59.123Z",
  "endpoint": "/ticker"
}
```

## 🔐 Authentication

- Market data endpoints: No authentication required
- Account/trading endpoints: Require KRAKEN_API_KEY and KRAKEN_API_SECRET in environment
- Configure these in your `.env.local` file

## 💡 Best Practices

1. **Use internal URLs** (`http://kraken:3240`) in workflows for better performance
2. **Handle errors** gracefully with try/catch in Function nodes
3. **Cache data** when possible to reduce API calls
4. **Test endpoints** using `/test` before building complex workflows
5. **Monitor rate limits** - Kraken has API call limitations

## 🔧 Troubleshooting

### Connection Issues
```javascript
// Test connectivity in Function node
try {
  const response = await $http.request({
    method: 'GET',
    url: 'http://kraken:3240/health'
  });
  return { status: 'Connected', data: response.data };
} catch (error) {
  return { status: 'Failed', error: error.message };
}
```

### API Key Issues
Check that your `.env.local` file contains:
```env
KRAKEN_API_KEY=your-api-key-here
KRAKEN_API_SECRET=your-api-secret-here
```
