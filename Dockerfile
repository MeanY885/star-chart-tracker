# Bun Build Stage
FROM oven/bun:1 as build

WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile || bun install

COPY . .
RUN bun run build

# Production Stage
FROM oven/bun:1-slim

WORKDIR /app
COPY package.json ./
RUN bun install --production

# Copy build artifacts
COPY --from=build /app/build ./build
COPY server.js database.js ./

# Setup data directory
RUN mkdir -p /app/data && chown -R bun:bun /app/data

USER bun
EXPOSE 1000
CMD ["bun", "run", "server.js"]
