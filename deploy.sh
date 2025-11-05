#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment..."

# Configuration
APP_NAME="ai-travel-planner"
DEPLOY_DIR="/opt/${APP_NAME}"
BACKUP_DIR="/opt/${APP_NAME}_backup_$(date +%Y%m%d_%H%M%S)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create deployment directory if it doesn't exist
if [ ! -d "$DEPLOY_DIR" ]; then
    print_status "Creating deployment directory: $DEPLOY_DIR"
    sudo mkdir -p "$DEPLOY_DIR"
    sudo chown $USER:$USER "$DEPLOY_DIR"
fi

cd "$DEPLOY_DIR"

# Backup current deployment if exists
if [ -f "docker-compose.yml" ]; then
    print_status "Backing up current deployment to: $BACKUP_DIR"
    sudo mkdir -p "$BACKUP_DIR"
    sudo cp -r "$DEPLOY_DIR" "$BACKUP_DIR/"
fi

# Pull latest code from repository
print_status "Pulling latest code..."
if [ -d ".git" ]; then
    git pull origin main
else
    print_warning "Git repository not found. Skipping git pull."
fi

# Stop and remove existing containers
print_status "Stopping existing containers..."
if docker ps -a | grep -q "$APP_NAME"; then
    docker-compose down || true
fi

# Remove old images to save space (keep last 2)
print_status "Cleaning up old Docker images..."
docker images | grep "$APP_NAME" | awk '{print $3}' | tail -n +3 | xargs -r docker rmi -f || true

# Build new Docker image
print_status "Building Docker image..."
docker build -t ${APP_NAME}:latest .

# Start containers
print_status "Starting containers..."
docker-compose up -d

# Wait for health check
print_status "Waiting for application to be healthy..."
sleep 10

# Check if container is running
if docker ps | grep -q "$APP_NAME"; then
    print_status "✅ Deployment successful!"
    print_status "Application is running at: http://localhost:3000"

    # Show container status
    docker ps | grep "$APP_NAME"

    # Show logs
    print_status "Recent logs:"
    docker logs --tail 20 "$APP_NAME"
else
    print_error "❌ Deployment failed! Container is not running."
    print_error "Checking logs..."
    docker logs "$APP_NAME" || true

    # Rollback to backup
    if [ -d "$BACKUP_DIR" ]; then
        print_warning "Attempting to rollback..."
        cd "$BACKUP_DIR/$APP_NAME"
        docker-compose up -d
    fi

    exit 1
fi

# Clean up old backups (keep last 5)
print_status "Cleaning up old backups..."
ls -dt /opt/${APP_NAME}_backup_* 2>/dev/null | tail -n +6 | xargs -r sudo rm -rf

print_status "🎉 Deployment completed successfully!"
