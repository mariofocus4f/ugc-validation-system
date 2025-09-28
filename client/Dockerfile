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

# Expose port 3000
EXPOSE 3000

# Start serve
CMD ["serve", "-s", "/app/build", "-l", "3000"]
