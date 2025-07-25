const express = require('express');
const cors = require('cors');
const { Kraken } = require('node-kraken-api');

// Environment validation
const requiredEnvVars = ['KRAKEN_API_KEY', 'KRAKEN_API_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env.local file');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3240;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize Kraken client with API credentials from environment variables
const kraken = new Kraken({
  key: process.env.KRAKEN_API_KEY,
  secret: process.env.KRAKEN_API_SECRET,
  tier: 4 // Adjust based on your Kraken account tier
});

console.log('✅ Kraken API client initialized successfully');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Kraken API Service' });
});

// Get server time (public endpoint, no auth required)
app.get('/api/time', async (req, res) => {
  try {
    const result = await kraken.time();
    res.json(result);
  } catch (error) {
    console.error('Error getting server time:', error);
    res.status(500).json({ error: 'Failed to get server time', details: error.message });
  }
});

// =============================================================================
// MARKET DATA ENDPOINTS (Public - No Authentication Required)
// =============================================================================

// Get system status
app.get('/api/system-status', async (req, res) => {
  try {
    const result = await kraken.systemStatus();
    res.json(result);
  } catch (error) {
    console.error('Error getting system status:', error);
    res.status(500).json({ 
      error: 'Failed to get system status', 
      details: error.message 
    });
  }
});

// Get asset information
app.get('/api/assets', async (req, res) => {
  try {
    const { asset, aclass } = req.query;
    const params = {};
    
    if (asset) params.asset = asset;
    if (aclass) params.aclass = aclass;

    const result = await kraken.assets(params);
    res.json(result);
  } catch (error) {
    console.error('Error getting assets:', error);
    res.status(500).json({ 
      error: 'Failed to get assets', 
      details: error.message,
      hint: 'Optional query parameters: asset (comma-separated), aclass (currency class)'
    });
  }
});

// Get tradable asset pairs
app.get('/api/asset-pairs', async (req, res) => {
  try {
    const { pair, info } = req.query;
    const params = {};
    
    if (pair) params.pair = pair;
    if (info) params.info = info;

    const result = await kraken.assetPairs(params);
    res.json(result);
  } catch (error) {
    console.error('Error getting asset pairs:', error);
    res.status(500).json({ 
      error: 'Failed to get asset pairs', 
      details: error.message,
      hint: 'Optional query parameters: pair (comma-separated), info (leverage|fees|margin)'
    });
  }
});

// Get ticker information
app.get('/api/ticker', async (req, res) => {
  try {
    const { pair } = req.query;
    const params = {};
    
    if (pair) {
      params.pair = pair;
    } else {
      return res.status(400).json({
        error: 'Missing required parameter',
        message: 'pair parameter is required',
        example: '/api/ticker?pair=XXBTZUSD'
      });
    }

    const result = await kraken.ticker(params);
    res.json(result);
  } catch (error) {
    console.error('Error getting ticker:', error);
    res.status(500).json({ 
      error: 'Failed to get ticker', 
      details: error.message,
      hint: 'Required query parameter: pair (e.g., XXBTZUSD, XETHZUSD)'
    });
  }
});

// Get OHLC (Open, High, Low, Close) data
app.get('/api/ohlc', async (req, res) => {
  try {
    const { pair, interval, since } = req.query;
    const params = {};
    
    if (pair) {
      params.pair = pair;
    } else {
      return res.status(400).json({
        error: 'Missing required parameter',
        message: 'pair parameter is required',
        example: '/api/ohlc?pair=XXBTZUSD&interval=60'
      });
    }
    
    if (interval) params.interval = parseInt(interval);
    if (since) params.since = since;

    const result = await kraken.ohlc(params);
    res.json(result);
  } catch (error) {
    console.error('Error getting OHLC data:', error);
    res.status(500).json({ 
      error: 'Failed to get OHLC data', 
      details: error.message,
      hint: 'Required: pair. Optional: interval (1,5,15,30,60,240,1440,10080,21600), since (timestamp)'
    });
  }
});

// Get order book depth
app.get('/api/depth', async (req, res) => {
  try {
    const { pair, count } = req.query;
    const params = {};
    
    if (pair) {
      params.pair = pair;
    } else {
      return res.status(400).json({
        error: 'Missing required parameter',
        message: 'pair parameter is required',
        example: '/api/depth?pair=XXBTZUSD&count=10'
      });
    }
    
    if (count) params.count = parseInt(count);

    const result = await kraken.depth(params);
    res.json(result);
  } catch (error) {
    console.error('Error getting order book depth:', error);
    res.status(500).json({ 
      error: 'Failed to get order book depth', 
      details: error.message,
      hint: 'Required: pair. Optional: count (maximum number of asks/bids, default 100)'
    });
  }
});

// Get recent trades
app.get('/api/trades', async (req, res) => {
  try {
    const { pair, since } = req.query;
    const params = {};
    
    if (pair) {
      params.pair = pair;
    } else {
      return res.status(400).json({
        error: 'Missing required parameter',
        message: 'pair parameter is required',
        example: '/api/trades?pair=XXBTZUSD'
      });
    }
    
    if (since) params.since = since;

    const result = await kraken.trades(params);
    res.json(result);
  } catch (error) {
    console.error('Error getting recent trades:', error);
    res.status(500).json({ 
      error: 'Failed to get recent trades', 
      details: error.message,
      hint: 'Required: pair. Optional: since (timestamp)'
    });
  }
});

// Get recent spread data
app.get('/api/spread', async (req, res) => {
  try {
    const { pair, since } = req.query;
    const params = {};
    
    if (pair) {
      params.pair = pair;
    } else {
      return res.status(400).json({
        error: 'Missing required parameter',
        message: 'pair parameter is required',
        example: '/api/spread?pair=XXBTZUSD'
      });
    }
    
    if (since) params.since = since;

    const result = await kraken.spread(params);
    res.json(result);
  } catch (error) {
    console.error('Error getting spread data:', error);
    res.status(500).json({ 
      error: 'Failed to get spread data', 
      details: error.message,
      hint: 'Required: pair. Optional: since (timestamp)'
    });
  }
});

// =============================================================================
// PRIVATE ENDPOINTS (Authentication Required)
// =============================================================================

// Get account balance (private endpoint, requires API key)
app.get('/api/balance', async (req, res) => {
  try {
    // Check if API credentials are configured
    if (!process.env.KRAKEN_API_KEY || !process.env.KRAKEN_API_SECRET) {
      return res.status(400).json({ 
        error: 'Kraken API credentials not configured',
        message: 'Please set KRAKEN_API_KEY and KRAKEN_API_SECRET environment variables'
      });
    }

    const result = await kraken.balance();
    res.json(result);
  } catch (error) {
    console.error('Error getting account balance:', error);
    res.status(500).json({ 
      error: 'Failed to get account balance', 
      details: error.message,
      hint: 'Make sure your API key has "Query Funds" permission'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Kraken API service running on port ${port}`);
  console.log(`📋 Health check: http://localhost:${port}/health`);
  console.log(`⏰ Server time: http://localhost:${port}/api/time`);
  console.log(`💰 Account balance: http://localhost:${port}/api/balance`);
  console.log('');
  console.log('📊 Market Data Endpoints:');
  console.log(`   System Status: http://localhost:${port}/api/system-status`);
  console.log(`   Assets: http://localhost:${port}/api/assets`);
  console.log(`   Asset Pairs: http://localhost:${port}/api/asset-pairs`);
  console.log(`   Ticker: http://localhost:${port}/api/ticker?pair=XXBTZUSD`);
  console.log(`   OHLC: http://localhost:${port}/api/ohlc?pair=XXBTZUSD`);
  console.log(`   Order Book: http://localhost:${port}/api/depth?pair=XXBTZUSD`);
  console.log(`   Recent Trades: http://localhost:${port}/api/trades?pair=XXBTZUSD`);
  console.log(`   Spread Data: http://localhost:${port}/api/spread?pair=XXBTZUSD`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
