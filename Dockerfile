# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets and server
COPY --from=build /app/build ./build
COPY server.js .

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"] 