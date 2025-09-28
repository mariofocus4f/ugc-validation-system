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

# Production stage with http-server
FROM node:18-alpine

# Install http-server globally
RUN npm install -g http-server

# Copy built app from build stage
COPY --from=build /app/build /app/build

# Debug: List files to verify build
RUN ls -la /app/build

# Expose port 80
EXPOSE 80

# Start http-server with debug
CMD ["sh", "-c", "echo 'Starting http-server...' && ls -la /app/build && http-server /app/build -p 80 -a 0.0.0.0"]
