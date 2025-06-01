#!/bin/bash

# FlowStack Development Setup Script
# This script ensures all services are started in the correct order

set -e

echo "🚀 Starting FlowStack Development Environment..."
echo ""

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
    echo ""
fi

# Check if core node_modules exist
if [ ! -d "core/node_modules" ]; then
    echo "📦 Core dependencies not found. Installing..."
    cd core && pnpm install && cd ..
    echo ""
fi

# Create .env file if it doesn't exist
if [ ! -f "apps/flowstack/.env" ]; then
    echo "📝 Creating .env file from example..."
    cp apps/flowstack/.env.example apps/flowstack/.env 2>/dev/null || {
        cat > apps/flowstack/.env << EOF
# FlowStack Proxy Configuration
PORT=3001
CORE_SERVER_URL=http://localhost:3000
CORE_UI_URL=http://localhost:8080
EOF
    }
    echo "✅ Created apps/flowstack/.env"
    echo ""
fi

# Build packages first
echo "🔨 Building packages..."
pnpm turbo run build --filter='@flowstack/*'

echo ""
echo "🎯 Starting all services..."
echo "   - Core Server will run on: http://localhost:3000"
echo "   - Core UI will run on: http://localhost:8080"  
echo "   - FlowStack Proxy will run on: http://localhost:3001"
echo ""
echo "📌 Access your application at: http://localhost:3001"
echo ""

# Start the development servers
exec pnpm dev 