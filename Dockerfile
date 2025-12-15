# Build stage with Node (react-scripts works better here)
FROM node:20-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# Production stage - lightweight
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

COPY --from=build /app/build ./build
COPY server.js database.js ./

RUN mkdir -p /app/data

EXPOSE 1000
CMD ["node", "server.js"]
