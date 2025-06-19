#!/bin/sh
# Wrapper script to start Flowise with proper environment setup

# Set the working directory to core
cd /usr/src/core

# Install core dependencies if they don't exist
if [ ! -d "node_modules" ]; then
    echo "Installing core dependencies..."
    pnpm install --no-frozen-lockfile
fi

# Use the built-in run script
exec ./packages/server/bin/run start