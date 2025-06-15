# 🌟 Millie's Star Chart - Deployment Guide

## 📋 Overview

This guide provides complete instructions for deploying Millie's Star Chart application using Docker. The app is now optimized for iPad screens and includes persistent database storage using SQLite.

## 🛠️ Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB+ available RAM
- 1GB+ available disk space

## 🚀 Quick Start

### Option 1: Development Mode
Perfect for testing and development with hot-reload:

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd StarChartTracker

# Install dependencies (for development)
npm install

# Start in development mode
docker-compose up dev
```

The app will be available at: http://localhost:2000

### Option 2: Production Mode
Optimized build with nginx reverse proxy:

```bash
# Build and start production services
docker-compose --profile production up -d

# Or without nginx (simpler setup)
docker-compose up app -d
```

**Production URLs:**
- With nginx: http://localhost:2000
- Without nginx: http://localhost:2000

## 📁 Project Structure

```
StarChartTracker/
├── src/                    # React frontend source
│   ├── App.js             # Main application (iPad optimized)
│   └── index.js           # React entry point
├── public/                # Static assets
│   └── index.html         # HTML template (touch optimized)
├── server.js              # Express backend server
├── database.js            # SQLite database module
├── Dockerfile             # Container build instructions
├── docker-compose.yml     # Multi-service orchestration
├── nginx.conf             # Nginx reverse proxy config
└── data/                  # Database storage (auto-created)
    └── star-chart.db      # SQLite database file
```

## 🗄️ Database Features

The app now includes persistent storage with SQLite:

### Tables Created:
- `star_chart`: Stores current points/stars
- `star_comments`: Stores comments and sticker types for each star
- `reward_settings`: Stores customizable reward settings

### Data Persistence:
- Star progress is automatically saved
- Comments and sticker selections persist
- Reward settings are customizable and saved
- Data survives container restarts

## 🎯 iPad Optimization Features

### Touch-Friendly Interface:
- Minimum 44px touch targets
- Prevent double-tap zoom
- Optimized button sizes for fingers
- Smooth touch interactions

### Responsive Design:
- Landscape orientation support
- Dynamic sizing for different iPad models
- Optimized spacing for touch interaction
- Proper viewport configuration

### Performance Optimizations:
- Hardware acceleration for animations
- Efficient star animations (30+ unique patterns)
- Optimized asset loading
- Touch action optimization

## 🐳 Docker Commands Reference

### Basic Operations:
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild containers
docker-compose build --no-cache

# View running containers
docker-compose ps
```

### Development Commands:
```bash
# Start development mode with live reload
docker-compose up dev

# Access development container shell
docker-compose exec dev sh

# Install new npm packages
docker-compose exec dev npm install <package-name>
```

### Production Commands:
```bash
# Deploy to production
docker-compose --profile production up -d

# Scale the app (multiple instances)
docker-compose --profile production up -d --scale app=3

# Update application
docker-compose --profile production down
docker-compose build
docker-compose --profile production up -d
```

## 🔧 Configuration Options

### Environment Variables:
```bash
# The app runs on port 2000 by default
# Internal container port is 3000, mapped to host port 2000

# Set Node environment
NODE_ENV=production docker-compose up app

# To use a different host port, modify docker-compose.yml:
# ports: - "YOUR_PORT:3000"
```

### Volume Mounts:
The database is stored in a Docker volume for persistence:
- Volume: `star-chart-data`
- Mount point: `/app/data`
- Contains: SQLite database and backups

## 📊 Monitoring & Health Checks

### Built-in Health Checks:
- HTTP endpoint monitoring
- 30-second interval checks
- Automatic container restart on failure
- Startup grace period of 40 seconds

### Log Monitoring:
```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f app

# View specific service logs
docker-compose logs nginx
```

## 🔄 Backup & Restore

### Database Backup:
```bash
# Create backup
docker-compose exec app sqlite3 /app/data/star-chart.db ".backup /app/data/backup-$(date +%Y%m%d-%H%M%S).db"

# Copy backup to host
docker cp $(docker-compose ps -q app):/app/data/backup-*.db ./backups/
```

### Database Restore:
```bash
# Copy backup to container
docker cp ./backups/backup-YYYYMMDD-HHMMSS.db $(docker-compose ps -q app):/app/data/

# Restore database
docker-compose exec app sqlite3 /app/data/star-chart.db ".restore /app/data/backup-YYYYMMDD-HHMMSS.db"
```

## 🚨 Troubleshooting

### Common Issues:

1. **Container won't start:**
   ```bash
   # Check logs
   docker-compose logs app
   
   # Rebuild container
   docker-compose build --no-cache app
   ```

2. **Database connection errors:**
   ```bash
   # Check database file permissions
   docker-compose exec app ls -la /app/data/
   
   # Recreate database
   docker-compose exec app rm /app/data/star-chart.db
   docker-compose restart app
   ```

3. **Port already in use:**
   ```bash
   # Use different port
   docker-compose -f docker-compose.yml -p startrack up -d
   
   # Or modify docker-compose.yml ports section
   ```

4. **Out of memory:**
   ```bash
   # Increase Docker memory limit
   # Docker Desktop: Settings > Resources > Memory
   
   # Or reduce container resources
   docker-compose up app --scale app=1
   ```

### Performance Tuning:

1. **For low-memory systems:**
   - Use single container: `docker-compose up app`
   - Disable nginx: Remove `--profile production`

2. **For high-traffic scenarios:**
   - Scale app instances: `--scale app=3`
   - Enable nginx load balancing
   - Use external database (PostgreSQL/MySQL)

## 🔐 Security Considerations

### Production Security:
- Non-root user in container
- Security headers via nginx
- No sensitive data in logs
- Database file permissions restricted
- Health check endpoints secured

### Network Security:
- Internal Docker network communication
- Nginx reverse proxy for SSL termination
- No direct database access from outside

## 📱 iPad Usage Tips

### Best Experience:
- Use in landscape mode for optimal layout
- Enable guided access to prevent accidental exits
- Use Safari or Chrome for best performance
- Add to home screen for app-like experience

### Touch Gestures:
- Tap stars to add/remove
- Long press for additional options
- Swipe gestures disabled to prevent interference
- Large touch targets for easy selection

## 🔄 Updates & Maintenance

### Updating the Application:
```bash
# Pull latest code
git pull origin main

# Rebuild and deploy
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Regular Maintenance:
```bash
# Clean up unused images
docker system prune -f

# Update base images
docker-compose pull
docker-compose build --pull

# Backup database weekly
# (Add to crontab for automation)
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review container logs: `docker-compose logs`
3. Verify system requirements are met
4. Ensure proper file permissions in data directory

---

**Happy Star Collecting! 🌟**

*Made with ❤️ for Millie*