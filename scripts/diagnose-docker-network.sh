#!/bin/bash

echo "🔍 Diagnosing Docker Network Issues..."
echo ""

# Test basic connectivity
echo "1. Testing npm registry connectivity..."
docker run --rm node:20-alpine npm ping || echo "❌ npm ping failed"

echo ""
echo "2. Testing DNS resolution..."
docker run --rm busybox nslookup registry.npmjs.org || echo "❌ DNS resolution failed"

# echo ""
# echo "3. Testing direct wget download..."
# docker run --rm alpine wget -qO- https://registry.npmjs.org/pnpm | head -n 5 || echo "❌ Direct download failed"

# echo ""
# echo "4. Current Docker network configuration..."
# docker network ls

# echo ""
# echo "5. Docker version info..."
# docker version --format '{{.Server.Version}}'

echo ""
echo "### Recommended fixes based on results above:"
echo "- If npm ping fails but wget works: Use Dockerfile.alternative"
echo "- If DNS fails: Configure Docker daemon with Google DNS"
echo "- If all fail: Check proxy/firewall settings" 