const express = require('express');
const path = require('path');
const StarChartDB = require('./database');
const app = express();

// Initialize database
const db = new StarChartDB();

// Middleware
app.use(express.json());
app.use(express.static('build'));

// Load data
app.get('/data/star-chart-data.json', async (req, res) => {
  try {
    const data = await db.getCurrentData();
    res.json(data);
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Save data
app.post('/data/save', async (req, res) => {
  try {
    await db.saveFullData(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Initialize database and start server
const PORT = process.env.PORT || 3000;

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