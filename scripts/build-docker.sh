#!/bin/bash

echo "🔨 Building FlowStack Docker Image..."
echo ""

# Set build options
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Clean up any previous builds
echo "Cleaning up old builds..."
docker builder prune -f

# Build with proper settings
echo "Building image..."
docker-compose build \
  --progress=plain \
  --no-cache \
  flowstack

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "You can now run: docker-compose up -d"
else
    echo ""
    echo "❌ Build failed. Trying alternative solutions..."
    echo ""
    echo "Option 1: Build directly with Docker (no compose):"
    echo "  docker build -t leadevs/fastflow:latest ."
    echo ""
    echo "Option 2: Use buildx for better networking:"
    echo "  docker buildx build --network=default -t leadevs/fastflow:latest ."
    echo ""
    echo "Option 3: Increase timeout and retry:"
    echo "  COMPOSE_HTTP_TIMEOUT=300 docker-compose build flowstack"
fi 