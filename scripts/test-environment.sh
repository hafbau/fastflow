#!/bin/sh
# Simple test script to verify environment before running flowise

echo "==============================================="
echo "ENVIRONMENT TEST SCRIPT STARTED AT $(date)"
echo "==============================================="

echo "Testing basic functionality..."

# Write to debug file
echo "$(date): Test script started" >> /tmp/flowise-debug.log

# Test basic commands
echo "PWD: $(pwd)"
echo "USER: $(whoami)"
echo "ID: $(id)"

# Test node
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Test file existence
echo "Testing file existence:"
echo "/usr/src/core exists: $(test -d /usr/src/core && echo 'YES' || echo 'NO')"
echo "/usr/src/core/packages/server/bin/run exists: $(test -f /usr/src/core/packages/server/bin/run && echo 'YES' || echo 'NO')"
echo "/usr/src/core/packages/server/bin/run executable: $(test -x /usr/src/core/packages/server/bin/run && echo 'YES' || echo 'NO')"

# Test database connection
echo "Testing database connection:"
pg_isready -h "$DATABASE_HOST" -p "$DATABASE_PORT" -U "$DATABASE_USER" && echo "DB connection: OK" || echo "DB connection: FAILED"

# Test if we can change to core directory
cd /usr/src/core || { echo "Failed to cd to /usr/src/core"; exit 1; }
echo "Successfully changed to: $(pwd)"

# Test if we can read the run script
echo "Contents of run script:"
cat packages/server/bin/run || { echo "Failed to read run script"; exit 1; }

# Test if we can execute node with the run script
echo "Testing node execution with run script:"
node packages/server/bin/run --help || { echo "Failed to execute run script with --help"; exit 1; }

echo "$(date): Test script completed successfully" >> /tmp/flowise-debug.log
echo "==============================================="
echo "ENVIRONMENT TEST COMPLETED SUCCESSFULLY"
echo "==============================================="

# Sleep to keep the process running
sleep 30