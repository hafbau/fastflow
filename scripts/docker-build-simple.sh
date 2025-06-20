#!/bin/bash

# Simple Docker build
echo "Building FlowStack image..."

# Try with BuildKit but simpler output
export DOCKER_BUILDKIT=1
export BUILDKIT_PROGRESS=plain

# Build the image
docker build -t flowstack:latest .

if [ $? -eq 0 ]; then
    echo "Build successful!"
    echo "You can now run: docker-compose up"
else
    echo "Build failed!"
    exit 1
fi