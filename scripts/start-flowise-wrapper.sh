#!/bin/sh
# Wrapper script to start Flowise with proper environment setup and extensive logging

echo "[FLOWISE-DEBUG] Starting flowise-core wrapper script..."
echo "[FLOWISE-DEBUG] Current working directory: $(pwd)"
echo "[FLOWISE-DEBUG] User: $(id)"
echo "[FLOWISE-DEBUG] Environment variables:"
env | grep -E "(DATABASE|FLOWISE|PORT|NODE)" | sort

# Set the working directory to core
echo "[FLOWISE-DEBUG] Changing to /usr/src/core directory..."
cd /usr/src/core || {
    echo "[FLOWISE-ERROR] Failed to change to /usr/src/core directory"
    exit 1
}

echo "[FLOWISE-DEBUG] Current directory: $(pwd)"
echo "[FLOWISE-DEBUG] Contents of /usr/src/core:"
ls -la

# Check if packages/server/bin/run exists
if [ ! -f "packages/server/bin/run" ]; then
    echo "[FLOWISE-ERROR] packages/server/bin/run does not exist!"
    echo "[FLOWISE-DEBUG] Contents of packages/server/bin/:"
    ls -la packages/server/bin/ || echo "[FLOWISE-ERROR] packages/server/bin/ directory not found"
    exit 1
fi

echo "[FLOWISE-DEBUG] packages/server/bin/run exists and is executable: $(ls -la packages/server/bin/run)"

# Install core dependencies if they don't exist
if [ ! -d "node_modules" ]; then
    echo "[FLOWISE-DEBUG] Installing core dependencies..."
    pnpm install --no-frozen-lockfile 2>&1 | tee /tmp/pnpm-install.log
    if [ $? -ne 0 ]; then
        echo "[FLOWISE-ERROR] Failed to install dependencies"
        cat /tmp/pnpm-install.log
        exit 1
    fi
else
    echo "[FLOWISE-DEBUG] node_modules directory exists"
fi

echo "[FLOWISE-DEBUG] Contents of packages/server/bin/run:"
cat packages/server/bin/run

echo "[FLOWISE-DEBUG] About to execute: ./packages/server/bin/run start"
echo "[FLOWISE-DEBUG] Node version: $(node --version)"
echo "[FLOWISE-DEBUG] NPM version: $(npm --version)"

# Use the built-in run script with full logging
echo "[FLOWISE-DEBUG] Executing flowise start command..."
exec ./packages/server/bin/run start 2>&1