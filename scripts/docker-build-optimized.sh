#!/bin/bash

echo "Building FlowStack with optimized Dockerfile..."

# Clean up first
echo "Cleaning up old builds..."
docker system prune -f

# Build with the optimized Dockerfile
echo "Building image..."
docker build -f Dockerfile.optimized -t flowstack:latest .

if [ $? -eq 0 ]; then
    echo "Build successful!"
    echo "You can now run: docker run -p 3000:3000 flowstack:latest"
else
    echo "Build failed!"
    echo ""
    echo "If you're still getting memory errors, try:"
    echo "1. Increase Docker Desktop memory (Preferences > Resources > Memory)"
    echo "2. Close other applications to free up memory"
    echo "3. Use GitHub Actions to build (push to main branch)"
    exit 1
fi