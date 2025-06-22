#!/bin/sh
# Simple flowise starter with timeout and aggressive logging

exec > >(tee -a /tmp/flowise-simple.log) 2>&1

echo "========================================="
echo "SIMPLE FLOWISE STARTER - $(date)"
echo "========================================="

# Write marker
echo "$(date): Simple starter began" >> /tmp/flowise-debug.log

# Change directory
cd /usr/src/core || exit 1
echo "Changed to: $(pwd)"

# Set a timeout to prevent hanging
echo "Starting flowise with 15 second timeout..."
timeout 15s ./packages/server/bin/run start || {
    echo "Flowise failed or timed out after 15 seconds"
    echo "$(date): Flowise timed out or failed" >> /tmp/flowise-debug.log
    exit 1
}

echo "Flowise exited normally"
echo "$(date): Flowise exited normally" >> /tmp/flowise-debug.log