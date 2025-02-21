# Stage 1: Build Angular app
FROM node:20.15-alpine AS angular-builder

WORKDIR /app
COPY . .
RUN npm install
RUN npx nx build web-app --configuration=production

# Stage 2: Serve Angular app using Nginx
FROM nginx:alpine

# Copy built Angular files into Nginx
COPY --from=angular-builder /app/dist/packages/web-app /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx (default command)
