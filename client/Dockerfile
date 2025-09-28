# Multi-stage build for React app
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Debug: List files to verify build
RUN ls -la /usr/share/nginx/html

# Create simple nginx config
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Debug: Show nginx config
RUN cat /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx with debug
CMD ["sh", "-c", "echo 'Starting nginx...' && ls -la /usr/share/nginx/html && cat /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
