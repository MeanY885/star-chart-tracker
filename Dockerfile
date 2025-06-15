# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install python and build dependencies for sqlite3
RUN apk add --no-cache python3 make g++

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets, server, and database module
COPY --from=build /app/build ./build
COPY server.js .
COPY database.js .

# Create data directory with proper permissions
RUN mkdir -p /app/data && chmod 755 /app/data

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 1000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
               const options = { host: 'localhost', port: 1000, path: '/', timeout: 2000 }; \
               const req = http.request(options, (res) => { res.statusCode === 200 ? process.exit(0) : process.exit(1); }); \
               req.on('error', () => process.exit(1)); \
               req.end();"

# Start server
CMD ["node", "server.js"] 