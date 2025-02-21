# Dockerfile for NestJS backend

# Stage 1: Build NestJS app
FROM node:20.15-alpine AS nest-builder

WORKDIR /app
COPY . .
RUN npm install
RUN npx nx build node-app

# Stage 2: Production stage for NestJS
FROM node:20.15-alpine

WORKDIR /app

# Copy NestJS build output
COPY --from=nest-builder /app/dist/packages/node-app ./dist/node-app

# Copy root package.json and package-lock.json (used by NestJS)
COPY --from=nest-builder /app/package.json ./dist/node-app/
COPY --from=nest-builder /app/package-lock.json ./dist/node-app/

# Install NestJS production dependencies
WORKDIR /app/dist/node-app
RUN npm install --production

# Expose ports
EXPOSE 3000

# Start NestJS server
CMD ["node", "main.js"]
