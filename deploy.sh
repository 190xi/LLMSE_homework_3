#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment..."

# Configuration
APP_NAME="ai-travel-planner"
DEPLOY_DIR="$HOME/deploy/${APP_NAME}"

# Check if IMAGE_TAG is provided
if [ -z "$IMAGE_TAG" ]; then
    echo "❌ ERROR: IMAGE_TAG environment variable is not set"
    echo "Usage: IMAGE_TAG=ghcr.io/user/repo:tag ./deploy.sh"
    exit 1
fi

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

# Ensure we're in the deployment directory
cd "$DEPLOY_DIR"

print_status "Deploying image: $IMAGE_TAG"

# Pull the latest image
print_status "Pulling Docker image..."
if ! docker pull "$IMAGE_TAG"; then
    print_error "Failed to pull Docker image: $IMAGE_TAG"
    exit 1
fi

# Stop and remove existing containers first
print_status "Stopping existing containers..."
if docker ps -a | grep -q "$APP_NAME"; then
    docker-compose down || true
fi

# Remove old 'latest' tag to avoid using stale image
print_status "Removing old latest tag if exists..."
docker rmi "${APP_NAME}:latest" 2>/dev/null || true

# Tag the pulled image as latest for docker-compose
print_status "Tagging new image as latest..."
docker tag "$IMAGE_TAG" "${APP_NAME}:latest"

# Start containers with the new image (force recreate to ensure new image is used)
print_status "Starting containers with new image..."
docker-compose up -d --force-recreate

# Wait for container to start
print_status "Waiting for container to start..."
sleep 5

# Check if container is running
if docker ps | grep -q "$APP_NAME"; then
    print_status "✅ Deployment successful!"
    print_status "Application is running at: http://localhost:3000"

    # Show container info
    print_status "Container info:"
    docker ps --filter "name=$APP_NAME" --format "table {{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

    # Show recent logs
    print_status "Recent logs:"
    docker logs --tail 20 "$APP_NAME"
else
    print_error "❌ Deployment failed! Container is not running."
    print_error "Checking logs..."
    docker logs "$APP_NAME" || true
    exit 1
fi

# Clean up old images (keep last 3 versions)
print_status "Cleaning up old Docker images..."
docker images "ghcr.io/*/${APP_NAME}" --format "{{.ID}}" | tail -n +4 | xargs -r docker rmi -f || true
docker images "${APP_NAME}" --format "{{.ID}}" | tail -n +4 | xargs -r docker rmi -f || true

print_status "🎉 Deployment completed successfully!"
print_status "Deployed image: $IMAGE_TAG"
