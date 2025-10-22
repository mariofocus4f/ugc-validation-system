#!/bin/bash

# UGC Validation System - Deployment Script
# This script deploys the system using Docker Compose

set -e

echo "🚀 UGC Validation System Deployment"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker found: $DOCKER_VERSION"
    else
        print_error "Docker is not installed. Please install Docker and try again."
        exit 1
    fi
}

# Check if Docker Compose is installed
check_docker_compose() {
    print_status "Checking Docker Compose installation..."
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        print_success "Docker Compose found: $COMPOSE_VERSION"
    else
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
}

# Check environment file
check_environment() {
    print_status "Checking environment configuration..."
    
    if [ ! -f ".env" ]; then
        print_warning "No .env file found. Creating from template..."
        cat > .env << EOF
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Production settings
NODE_ENV=production
EOF
        print_warning "Please edit .env file and add your OpenAI API key!"
        return 1
    fi
    
    if grep -q "OPENAI_API_KEY=your_openai_api_key_here" .env; then
        print_warning "OpenAI API key not configured in .env file!"
        print_warning "Please edit .env and add your OpenAI API key."
        return 1
    fi
    
    print_success "Environment configuration looks good."
    return 0
}

# Build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose down --remove-orphans
    
    # Build and start services
    print_status "Building images..."
    docker-compose build --no-cache
    
    print_status "Starting services..."
    docker-compose up -d
    
    print_success "Services started successfully!"
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Wait for services to start
    sleep 10
    
    # Check API health
    if curl -f http://localhost:3001/api/health &> /dev/null; then
        print_success "API service is healthy"
    else
        print_warning "API service health check failed"
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 &> /dev/null; then
        print_success "Frontend service is healthy"
    else
        print_warning "Frontend service health check failed"
    fi
    
    # Check nginx (if enabled)
    if curl -f http://localhost:80/health &> /dev/null; then
        print_success "Nginx proxy is healthy"
    else
        print_warning "Nginx proxy health check failed (may not be enabled)"
    fi
}

# Show deployment info
show_info() {
    echo ""
    print_success "Deployment completed!"
    echo ""
    print_status "Service URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  API: http://localhost:3001"
    echo "  Nginx: http://localhost:80 (if enabled)"
    echo ""
    print_status "Useful commands:"
    echo "  View logs: docker-compose logs -f"
    echo "  Stop services: docker-compose down"
    echo "  Restart services: docker-compose restart"
    echo "  Update services: docker-compose pull && docker-compose up -d"
    echo ""
}

# Main deployment function
main() {
    echo ""
    
    # Run checks
    check_docker
    check_docker_compose
    
    # Check environment
    if ! check_environment; then
        print_warning "Please configure your environment and run this script again."
        exit 1
    fi
    
    # Deploy services
    deploy_services
    
    # Check health
    check_health
    
    # Show info
    show_info
}

# Handle script interruption
trap 'echo ""; print_warning "Deployment interrupted by user."; exit 1' INT

# Run main function
main "$@"
