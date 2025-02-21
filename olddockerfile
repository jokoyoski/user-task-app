# Stage 1: Build Angular app
FROM node:20.15-alpine AS angular-builder

WORKDIR /app
COPY . .
RUN npm install
RUN npx nx build web-app

# Stage 2: Build NestJS app
FROM node:20.15-alpine AS nest-builder

WORKDIR /app
COPY . .
RUN npm install
RUN npx nx build node-app

# Stage 3: Serve Angular with Nginx
FROM nginx:alpine AS angular-server
COPY --from=angular-builder /app/dist/packages/web-app /usr/share/nginx/html

# Stage 4: Final stage for NestJS
FROM node:20.15-alpine AS stage-2

WORKDIR /app

# Copy NestJS build output
COPY --from=nest-builder /app/dist/packages/node-app ./dist/node-app

# Copy root package.json and package-lock.json (used by NestJS)
COPY --from=nest-builder /app/package.json ./dist/node-app/
COPY --from=nest-builder /app/package-lock.json ./dist/node-app/

# Install NestJS production dependencies
WORKDIR /app/dist/node-app
RUN npm install

# Expose ports
EXPOSE 3000

# Start NestJS server
CMD ["node", "main.js"]
