#!/bin/sh
# Comprehensive startup diagnostic that outputs everything to stdout
# This will be captured by CloudWatch in ECS

echo "===== FLOWISE STARTUP DIAGNOSTIC ====="
echo "Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "======================================"

# System Information
echo ""
echo "=== SYSTEM INFO ==="
echo "Hostname: $(hostname)"
echo "Kernel: $(uname -r)"
echo "Architecture: $(uname -m)"
echo "Memory:"
free -h 2>/dev/null || echo "  (free command not available)"
echo "CPU info:"
nproc 2>/dev/null || echo "  (nproc not available)"

# Environment Variables
echo ""
echo "=== ENVIRONMENT VARIABLES ==="
env | grep -E "DATABASE|FLOWISE|PORT|NODE|AWS|ECS" | sort | while read line; do
    # Mask passwords
    if echo "$line" | grep -q "PASSWORD"; then
        key=$(echo "$line" | cut -d= -f1)
        echo "$key=***MASKED***"
    else
        echo "$line"
    fi
done

# Node.js Check
echo ""
echo "=== NODE.JS CHECK ==="
echo "Node location: $(which node 2>/dev/null || echo 'NOT FOUND')"
echo "Node version: $(node --version 2>&1 || echo 'FAILED TO RUN')"
echo "NPM version: $(npm --version 2>&1 || echo 'FAILED TO RUN')"

# File System Check
echo ""
echo "=== FILE SYSTEM CHECK ==="
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

if [ -d "/usr/src/core" ]; then
    echo ""
    echo "Core directory exists:"
    ls -la /usr/src/core/ | head -10
    
    if [ -f "/usr/src/core/packages/server/bin/run" ]; then
        echo ""
        echo "Run script found:"
        ls -la /usr/src/core/packages/server/bin/run
        echo "First 5 lines of run script:"
        head -5 /usr/src/core/packages/server/bin/run
    else
        echo "ERROR: Run script not found at /usr/src/core/packages/server/bin/run"
    fi
    
    if [ -d "/usr/src/core/node_modules" ]; then
        echo ""
        echo "node_modules exists. Checking for @oclif/core:"
        if [ -d "/usr/src/core/node_modules/@oclif/core" ]; then
            echo "@oclif/core found"
            if [ -f "/usr/src/core/node_modules/@oclif/core/package.json" ]; then
                echo "@oclif/core version: $(grep '"version"' /usr/src/core/node_modules/@oclif/core/package.json | head -1)"
            fi
        else
            echo "ERROR: @oclif/core not found in node_modules"
        fi
    else
        echo "ERROR: node_modules directory not found"
    fi
else
    echo "ERROR: /usr/src/core directory not found"
fi

# Database Connectivity Test
echo ""
echo "=== DATABASE CONNECTIVITY TEST ==="
if [ "$DATABASE_TYPE" = "postgres" ]; then
    echo "Testing PostgreSQL connection..."
    echo "Host: $DATABASE_HOST"
    echo "Port: $DATABASE_PORT"
    echo "Database: $DATABASE_NAME"
    echo "User: $DATABASE_USER"
    echo "SSL: $DATABASE_SSL"
    
    # Test with pg_isready if available
    if command -v pg_isready >/dev/null 2>&1; then
        pg_isready -h "$DATABASE_HOST" -p "$DATABASE_PORT" -U "$DATABASE_USER" -d "$DATABASE_NAME" 2>&1 || echo "pg_isready check failed"
    else
        echo "pg_isready not available"
    fi
    
    # Test with nc if available
    if command -v nc >/dev/null 2>&1; then
        echo "Testing port connectivity:"
        nc -zv "$DATABASE_HOST" "$DATABASE_PORT" 2>&1 || echo "Port check failed"
    fi
else
    echo "Database type: $DATABASE_TYPE"
fi

# Test Node.js execution
echo ""
echo "=== NODE.JS EXECUTION TEST ==="
cd /usr/src/core 2>/dev/null || echo "Failed to cd to /usr/src/core"

# Simple Node test
echo "Testing basic Node.js execution:"
node -e "console.log('Node.js can execute code')" 2>&1 || echo "FAILED: Basic Node.js execution"

# Test require
echo ""
echo "Testing module loading:"
node -e "
try {
    console.log('Testing require functionality...');
    const fs = require('fs');
    const path = require('path');
    console.log('Core modules loaded successfully');
    
    // Try to load @oclif/core
    try {
        const oclif = require('@oclif/core');
        console.log('@oclif/core loaded successfully');
    } catch (e) {
        console.error('Failed to load @oclif/core:', e.message);
        console.error('Error code:', e.code);
    }
} catch (e) {
    console.error('Module loading test failed:', e);
}
" 2>&1

# Try running the actual command
echo ""
echo "=== ATTEMPTING FLOWISE START ==="
echo "Running: node /usr/src/core/packages/server/bin/run --version"
cd /usr/src/core && node packages/server/bin/run --version 2>&1 || echo "FAILED: Version check"

# Try with explicit error capture
echo ""
echo "=== TESTING NODE ERROR HANDLING ==="
cd /usr/src/core && node -e "
process.on('uncaughtException', (err) => {
    console.error('Test uncaught exception:', err);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Test unhandled rejection:', reason);
    process.exit(1);
});
console.log('Node error handling test passed');
" 2>&1

# Try running with strace if available
echo ""
echo "=== SYSTEM CALL TRACE (if available) ==="
if command -v strace >/dev/null 2>&1; then
    echo "Running with strace (first 100 lines):"
    cd /usr/src/core && timeout 5 strace -f -e trace=execve,open,openat node packages/server/bin/run start 2>&1 | head -100 || echo "Strace capture completed"
else
    echo "strace not available in container"
fi

# Check for missing shared libraries
echo ""
echo "=== SHARED LIBRARY CHECK ==="
if command -v ldd >/dev/null 2>&1; then
    echo "Checking node binary dependencies:"
    ldd $(which node) 2>&1 || echo "Failed to check node dependencies"
else
    echo "ldd not available"
fi

# Final memory check
echo ""
echo "=== FINAL SYSTEM STATE ==="
echo "Memory usage:"
free -m 2>/dev/null || echo "free command not available"
echo ""
echo "Disk usage:"
df -h 2>/dev/null || echo "df command not available"

echo ""
echo "===== END DIAGNOSTIC ====="
echo "Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "========================="

# Now actually try to start flowise
echo ""
echo "=== STARTING FLOWISE ==="
exec /usr/local/bin/start-flowise-wrapper