# Build stage
FROM node:20-alpine as build

WORKDIR /app
COPY package*.json ./
# Install all dependencies including devDependencies
RUN npm install

COPY . .
# Build the app using Vite
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
# Install only production dependencies
RUN npm install --omit=dev

# Copy built assets
COPY --from=build /app/build ./build
COPY server.js database.js ./

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 1000

# Start server (running as root to avoid volume permission issues)
CMD ["node", "server.js"]
