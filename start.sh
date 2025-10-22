#!/bin/bash

# UGC Validation System - Startup Script
# This script sets up and starts the complete UGC validation system

set -e

echo "🚀 Starting UGC Validation System Setup"
echo "========================================"

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

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 16+ and try again."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    print_status "Installing root dependencies..."
    npm install
    
    # Install server dependencies
    print_status "Installing server dependencies..."
    cd server
    npm install
    cd ..
    
    # Install client dependencies
    print_status "Installing client dependencies..."
    cd client
    npm install
    cd ..
    
    print_success "All dependencies installed successfully!"
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Check if .env exists in server directory
    if [ ! -f "server/.env" ]; then
        if [ -f "server/env.example" ]; then
            print_status "Creating .env file from template..."
            cp server/env.example server/.env
            print_warning "Please edit server/.env and add your OpenAI API key!"
            print_warning "The system will not work without a valid OpenAI API key."
        else
            print_error "Environment template not found. Please create server/.env manually."
            exit 1
        fi
    else
        print_success "Environment file already exists."
    fi
}

# Check OpenAI API key
check_openai_key() {
    print_status "Checking OpenAI API key..."
    
    if [ -f "server/.env" ]; then
        if grep -q "OPENAI_API_KEY=your_openai_api_key_here" server/.env; then
            print_warning "OpenAI API key not configured!"
            print_warning "Please edit server/.env and add your OpenAI API key."
            print_warning "You can get an API key from: https://platform.openai.com/api-keys"
            return 1
        else
            print_success "OpenAI API key appears to be configured."
            return 0
        fi
    else
        print_error "Environment file not found!"
        return 1
    fi
}

# Start the system
start_system() {
    print_status "Starting UGC Validation System..."
    
    # Check if OpenAI key is configured
    if ! check_openai_key; then
        print_warning "System will start but validation will not work without OpenAI API key."
    fi
    
    print_success "Starting development servers..."
    print_status "Frontend will be available at: http://localhost:3000"
    print_status "Backend API will be available at: http://localhost:3001"
    print_status "Press Ctrl+C to stop the system"
    
    # Start both frontend and backend
    npm run dev
}

# Main execution
main() {
    echo ""
    print_status "UGC Validation System Setup"
    echo ""
    
    # Run checks and setup
    check_node
    check_npm
    install_dependencies
    setup_environment
    
    echo ""
    print_success "Setup completed successfully!"
    echo ""
    
    # Ask user if they want to start the system
    read -p "Do you want to start the system now? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_system
    else
        print_status "Setup complete. Run 'npm run dev' to start the system."
        print_status "Or run this script again to start automatically."
    fi
}

# Handle script interruption
trap 'echo ""; print_warning "Setup interrupted by user."; exit 1' INT

# Run main function
main "$@"

