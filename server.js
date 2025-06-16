const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Use persistent file-based database
const fs = require('fs');
const dataDir = '/app/data';
const dbPath = '/app/data/star_charts.db';

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory:', dataDir);
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to persistent SQLite database at:', dbPath);
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS star_charts (
        child_name TEXT PRIMARY KEY,
        goal_prize TEXT NOT NULL,
        total_stars INTEGER NOT NULL,
        current_stars INTEGER NOT NULL,
        super_star_value INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Helper function to create URL-safe child name
function createUrlSafeName(name) {
    return encodeURIComponent(name.toLowerCase().trim());
}

// Helper function to decode URL-safe child name
function decodeUrlSafeName(urlName) {
    return decodeURIComponent(urlName);
}

app.get('/api/chart/:name', (req, res) => {
    const childName = decodeUrlSafeName(req.params.name);
    
    db.get('SELECT * FROM star_charts WHERE child_name = ?', [childName], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (!row) {
            res.status(404).json({ error: 'Chart not found' });
            return;
        }
        
        res.json({
            childName: row.child_name,
            goalPrize: row.goal_prize,
            totalStars: row.total_stars,
            currentStars: row.current_stars,
            superStarValue: row.super_star_value,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    });
});

app.post('/api/chart', (req, res) => {
    const { childName, goalPrize, totalStars, superStarValue } = req.body;
    const currentStars = 0;
    
    if (!childName || !childName.trim()) {
        res.status(400).json({ error: 'Child name is required' });
        return;
    }
    
    db.run(`INSERT OR REPLACE INTO star_charts (child_name, goal_prize, total_stars, current_stars, super_star_value)
            VALUES (?, ?, ?, ?, ?)`,
        [childName.trim(), goalPrize, totalStars, currentStars, superStarValue],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            res.json({
                childName: childName.trim(),
                goalPrize,
                totalStars,
                currentStars,
                superStarValue,
                urlName: createUrlSafeName(childName)
            });
        }
    );
});

app.put('/api/chart/:name', (req, res) => {
    const childName = decodeUrlSafeName(req.params.name);
    const { goalPrize, totalStars, currentStars, superStarValue } = req.body;
    
    db.run(`UPDATE star_charts 
            SET goal_prize = ?, total_stars = ?, current_stars = ?, super_star_value = ?, updated_at = CURRENT_TIMESTAMP
            WHERE child_name = ?`,
        [goalPrize, totalStars, currentStars, superStarValue, childName],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (this.changes === 0) {
                res.status(404).json({ error: 'Chart not found' });
                return;
            }
            
            res.json({
                childName,
                goalPrize,
                totalStars,
                currentStars,
                superStarValue
            });
        }
    );
});

app.put('/api/chart/:name/stars', (req, res) => {
    const childName = decodeUrlSafeName(req.params.name);
    const { currentStars } = req.body;
    
    db.run(`UPDATE star_charts 
            SET current_stars = ?, updated_at = CURRENT_TIMESTAMP
            WHERE child_name = ?`,
        [currentStars, childName],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (this.changes === 0) {
                res.status(404).json({ error: 'Chart not found' });
                return;
            }
            
            res.json({ childName, currentStars });
        }
    );
});

app.get('/api/network-info', (req, res) => {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    
    // Find the first non-internal IPv4 address
    let networkIP = 'localhost';
    
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                networkIP = iface.address;
                break;
            }
        }
        if (networkIP !== 'localhost') break;
    }
    
    res.json({ 
        ip: networkIP, 
        port: PORT,
        hostname: req.get('host')
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', () => {
    db.close();
    process.exit(0);
});