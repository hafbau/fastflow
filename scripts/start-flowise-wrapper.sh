#!/bin/sh
# Wrapper script to start Flowise with proper environment setup and extensive logging

# Write to a file to ensure we can see the logs even if stdout/stderr is lost
exec > >(tee -a /tmp/flowise-wrapper.log) 2>&1

echo "[FLOWISE-DEBUG] ========================================"
echo "[FLOWISE-DEBUG] WRAPPER SCRIPT STARTED AT $(date)"
echo "[FLOWISE-DEBUG] ========================================"
echo "[FLOWISE-DEBUG] Starting flowise-core wrapper script..."
echo "[FLOWISE-DEBUG] Current working directory: $(pwd)"
echo "[FLOWISE-DEBUG] User: $(id)"
echo "[FLOWISE-DEBUG] Script path: $0"
echo "[FLOWISE-DEBUG] Script args: $@"
echo "[FLOWISE-DEBUG] Environment variables:"
env | grep -E "(DATABASE|FLOWISE|PORT|NODE)" | sort

# Also write a simple marker to a file
echo "$(date): Wrapper script started" >> /tmp/flowise-debug.log

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
echo "$(date): About to exec ./packages/server/bin/run start" >> /tmp/flowise-debug.log

# Test if the run script is actually executable and exists
if [ ! -x "./packages/server/bin/run" ]; then
    echo "[FLOWISE-ERROR] ./packages/server/bin/run is not executable!" >> /tmp/flowise-debug.log
    echo "[FLOWISE-ERROR] ./packages/server/bin/run is not executable!"
    exit 1
fi

# Try to run node directly to test if that works
echo "[FLOWISE-DEBUG] Testing node directly first..."
node --version || {
    echo "[FLOWISE-ERROR] Node is not working!" >> /tmp/flowise-debug.log
    echo "[FLOWISE-ERROR] Node is not working!"
    exit 1
}

echo "$(date): Node test passed, executing run script" >> /tmp/flowise-debug.log

# Execute with explicit error handling
exec ./packages/server/bin/run start