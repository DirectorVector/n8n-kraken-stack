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

## 🚨 Error Handling

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
