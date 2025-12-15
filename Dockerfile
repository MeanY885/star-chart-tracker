# Build stage
FROM node:20-alpine as build

WORKDIR /app
COPY package*.json ./
# Install all dependencies including devDependencies (needed for vite build)
RUN npm ci

COPY . .
# Build the app using Vite
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
# Install only production dependencies
RUN npm ci --omit=dev

# Copy built assets
COPY --from=build /app/build ./build
COPY server.js database.js ./

# Create data directory
RUN mkdir -p /app/data && chown -R node:node /app/data

USER node
EXPOSE 1000
CMD ["node", "server.js"]
