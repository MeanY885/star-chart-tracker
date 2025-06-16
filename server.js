const express = require('express');
const path = require('path');
const StarChartDB = require('./database');
const app = express();

// Initialize database
const db = new StarChartDB();

// Middleware
app.use(express.json());
app.use(express.static('build'));

// Load data with better caching headers for cross-device sync
app.get('/data/star-chart-data.json', async (req, res) => {
  try {
    // Disable caching to ensure fresh data across devices
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const data = await db.getCurrentData();
    res.json(data);
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Save data with immediate response
app.post('/data/save', async (req, res) => {
  try {
    await db.saveFullData(req.body);
    
    // Set headers to prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Add sync endpoint for real-time updates
app.get('/data/sync', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const data = await db.getCurrentData();
    res.json({ 
      ...data, 
      lastUpdated: new Date().toISOString(),
      serverTime: Date.now()
    });
  } catch (error) {
    console.error('Error syncing data:', error);
    res.status(500).json({ error: 'Failed to sync data' });
  }
});

// Initialize database and start server
const PORT = process.env.PORT || 1000;

async function startServer() {
  try {
    await db.initialize();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Database connected and ready');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  db.close();
  process.exit(0);
});

startServer(); 