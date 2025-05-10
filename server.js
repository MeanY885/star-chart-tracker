const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

const DATA_FILE = path.join(__dirname, 'data', 'star-chart-data.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error('Error creating data directory:', error);
    }
  }
}

// Middleware
app.use(express.json());
app.use(express.static('build'));

// Load data
app.get('/data/star-chart-data.json', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.json({ points: 0, starComments: {} });
    } else {
      console.error('Error reading data:', error);
      res.status(500).json({ error: 'Failed to read data' });
    }
  }
});

// Save data
app.post('/data/save', async (req, res) => {
  try {
    await ensureDataDir();
    await fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 