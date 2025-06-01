#!/bin/bash

# FlowStack Development Startup Script

set -e

echo "🚀 Starting FlowStack Development Environment..."
echo ""

# Create .env if it doesn't exist
if [ ! -f "apps/flowstack/.env" ]; then
    echo "📝 Creating .env file..."
    echo "PORT=3001" > apps/flowstack/.env
    echo "CORE_SERVER_URL=http://localhost:3000" >> apps/flowstack/.env
    echo "CORE_UI_URL=http://localhost:8080" >> apps/flowstack/.env
    echo "✅ Created apps/flowstack/.env"
    echo ""
fi

# Build FlowStack packages only (skip core for now)
echo "🔨 Building FlowStack packages..."
pnpm turbo run build --filter='@flowstack/*' || echo "⚠️  No FlowStack packages to build yet"

echo ""
echo "🎯 Starting FlowStack proxy server..."
echo "   - FlowStack Proxy will run on: http://localhost:3001"
echo ""
echo "📌 You'll need to start the core Flowise services separately:"
echo "   - In another terminal, run: cd core && pnpm dev"
echo ""
echo "🌐 Once core is running, access your application at: http://localhost:3001"
echo ""

# Start just the proxy server
cd apps/flowstack && pnpm dev 