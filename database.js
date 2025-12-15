const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

class StarChartDB {
  constructor() {
    this.dbPath = path.join(__dirname, 'data', 'star-chart.db');
    this.db = null;
  }

  async initialize() {
    try {
      // Ensure data directory exists
      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
      
      // Create database connection
      this.db = new sqlite3.Database(this.dbPath);
      
      // Create tables
      await this.createTables();
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  createTables() {
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS star_chart (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          points INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS star_comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          star_index INTEGER NOT NULL,
          comment TEXT,
          sticker_type INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS reward_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          stars_required INTEGER NOT NULL DEFAULT 15,
          reward_title TEXT NOT NULL DEFAULT 'Special Day Out! 🎉',
          reward_description TEXT NOT NULL DEFAULT 'Choose any fun activity for a special family day!',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS theme_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          theme TEXT DEFAULT 'default',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Insert default settings if none exist
        INSERT OR IGNORE INTO star_chart (id, points) VALUES (1, 0);
        INSERT OR IGNORE INTO reward_settings (id, stars_required, reward_title, reward_description) 
        VALUES (1, 15, 'Special Day Out! 🎉', 'Choose any fun activity for a special family day!');
        INSERT OR IGNORE INTO theme_settings (id, theme) VALUES (1, 'default');
      `;

      this.db.exec(sql, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async getCurrentData() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          sc.points,
          rs.stars_required,
          rs.reward_title,
          rs.reward_description,
          ts.theme
        FROM star_chart sc
        CROSS JOIN reward_settings rs
        CROSS JOIN theme_settings ts
        WHERE sc.id = 1 AND rs.id = 1 AND ts.id = 1
      `;

      this.db.get(sql, (error, row) => {
        if (error) {
          reject(error);
        } else {
          // Get comments
          this.getComments().then(comments => {
            resolve({
              points: row ? row.points : 0,
              starComments: comments.comments,
              stickerTypes: comments.stickerTypes,
              currentTheme: row ? row.theme : 'default',
              rewardPreview: {
                stars: row ? row.stars_required : 15,
                reward: row ? row.reward_title : 'Special Day Out! 🎉',
                description: row ? row.reward_description : 'Choose any fun activity for a special family day!'
              }
            });
          }).catch(reject);
        }
      });
    });
  }

  async getComments() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT star_index, comment, sticker_type FROM star_comments ORDER BY star_index';
      
      this.db.all(sql, (error, rows) => {
        if (error) {
          reject(error);
        } else {
          const comments = {};
          const stickerTypes = {};
          
          rows.forEach(row => {
            if (row.comment) {
              comments[row.star_index] = row.comment;
            }
            if (row.sticker_type !== null) {
              stickerTypes[row.star_index] = row.sticker_type;
            }
          });
          
          resolve({ comments, stickerTypes });
        }
      });
    });
  }

  async updatePoints(points) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE star_chart SET points = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1';
      
      this.db.run(sql, [points], function(error) {
        if (error) {
          reject(error);
        } else {
          resolve({ success: true, changes: this.changes });
        }
      });
    });
  }

  async updateComments(starComments, stickerTypes = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        // Clear existing comments
        await new Promise((res, rej) => {
          this.db.run('DELETE FROM star_comments', (error) => {
            if (error) rej(error);
            else res();
          });
        });

        // Insert new comments
        if (Object.keys(starComments).length > 0 || Object.keys(stickerTypes).length > 0) {
          const allIndices = new Set([
            ...Object.keys(starComments).map(Number),
            ...Object.keys(stickerTypes).map(Number)
          ]);

          const stmt = this.db.prepare(
            'INSERT INTO star_comments (star_index, comment, sticker_type) VALUES (?, ?, ?)'
          );

          for (const index of allIndices) {
            const comment = starComments[index] || null;
            const stickerType = stickerTypes[index] !== undefined ? stickerTypes[index] : 0;
            
            stmt.run(index, comment, stickerType);
          }

          stmt.finalize((error) => {
            if (error) {
              reject(error);
            } else {
              resolve({ success: true });
            }
          });
        } else {
          resolve({ success: true });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  async updateRewardSettings(rewardSettings) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE reward_settings 
        SET stars_required = ?, reward_title = ?, reward_description = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = 1
      `;
      
      this.db.run(sql, [
        rewardSettings.stars,
        rewardSettings.reward,
        rewardSettings.description
      ], function(error) {
        if (error) {
          reject(error);
        } else {
          resolve({ success: true, changes: this.changes });
        }
      });
    });
  }

  async updateTheme(theme) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE theme_settings SET theme = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1';
      
      this.db.run(sql, [theme], function(error) {
        if (error) {
          reject(error);
        } else {
          resolve({ success: true, changes: this.changes });
        }
      });
    });
  }

  async saveFullData(data) {
    return new Promise(async (resolve, reject) => {
      try {
        // Update points
        if (data.points !== undefined) {
          await this.updatePoints(data.points);
        }
        
        // Update theme
        if (data.currentTheme) {
          await this.updateTheme(data.currentTheme);
        }
        
        // Update comments and sticker types
        if (data.starComments || data.stickerTypes) {
          await this.updateComments(data.starComments || {}, data.stickerTypes || {});
        }
        
        // Update reward settings if provided
        if (data.rewardPreview) {
          await this.updateRewardSettings(data.rewardPreview);
        }
        
        resolve({ success: true });
      } catch (error) {
        reject(error);
      }
    });
  }

  close() {
    if (this.db) {
      this.db.close((error) => {
        if (error) {
          console.error('Error closing database:', error);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

module.exports = StarChartDB;