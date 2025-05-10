# Star Chart Tracker

A delightful and interactive reward tracking system built specifically for children to track achievements and earn rewards. The application features beautiful animations, interactive stars, and a celebration system when reaching goals.

## Features

- Interactive star chart with 15 stars
- Beautiful animations and particle effects
- Comment system for recording achievements
- Celebration modal upon reaching goals
- Persistent storage of progress
- Mobile-responsive design

## Technologies Used

- React
- Material-UI
- Framer Motion
- tsparticles
- Docker

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server
npm start
# or with Docker
docker-compose up dev
```

### Production

```bash
# Build and run with Docker
docker-compose up prod
```

The application will be available at:
- Development: http://localhost:3000
- Production: http://localhost:1337

## Docker Support

The project includes:
- Multi-stage Dockerfile for optimized production builds
- Docker Compose configuration for both development and production
- Nginx configuration for serving the application
- Development environment with hot-reloading

## Project Structure

```
star-chart-tracker/
├── src/
│   ├── App.js           # Main application component
│   └── ...
├── public/
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 