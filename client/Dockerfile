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

# Production stage with serve
FROM node:18-alpine

# Install serve globally
RUN npm install -g serve

# Copy built app from build stage
COPY --from=build /app/build /app/build

# Debug: List files to verify build
RUN ls -la /app/build

# Expose port 80
EXPOSE 80

# Start serve with debug
CMD ["sh", "-c", "echo 'Starting serve...' && ls -la /app/build && serve -s /app/build -l 80 --host 0.0.0.0"]
