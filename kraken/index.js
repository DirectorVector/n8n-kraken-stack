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
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
