# Simple Bun-based build
FROM oven/bun:1 as build

WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile || bun install

COPY . .
ENV GENERATE_SOURCEMAP=false
RUN bun run build

# Production - serve with Bun
FROM oven/bun:1-slim

WORKDIR /app
COPY package.json ./
RUN bun install --production

COPY --from=build /app/build ./build
COPY server.js database.js ./

RUN mkdir -p /app/data

EXPOSE 1000
CMD ["bun", "run", "server.js"]
