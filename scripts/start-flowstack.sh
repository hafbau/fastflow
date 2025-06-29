#!/bin/sh
# Production-ready FlowStack startup script with Enterprise features

set -e

# Redirect output to both stdout and log file for debugging
exec > >(tee -a /var/log/flowstack/startup.log) 2>&1

echo "[FLOWSTACK] Starting FlowStack Enterprise at $(date)"
echo "[FLOWSTACK] Node version: $(node --version)"
echo "[FLOWSTACK] Environment: ${NODE_ENV:-production}"

# Function to handle graceful shutdown
cleanup() {
    echo "[FLOWSTACK] Received shutdown signal, cleaning up..."
    # Kill all child processes
    pkill -P $$ || true
    # Wait for processes to terminate
    sleep 2
    echo "[FLOWSTACK] Shutdown complete"
    exit 0
}

# Set up signal handlers for graceful shutdown
trap cleanup SIGTERM SIGINT SIGQUIT

# Change to core directory
cd /usr/src/core || {
    echo "[FLOWSTACK] ERROR: Failed to change to /usr/src/core directory"
    exit 1
}

# Implement restart delay to prevent rapid cycling
RESTART_DELAY_FILE="/tmp/flowstack-restart-delay"
if [ -f "$RESTART_DELAY_FILE" ]; then
    LAST_RESTART=$(cat "$RESTART_DELAY_FILE")
    CURRENT_TIME=$(date +%s)
    TIME_DIFF=$((CURRENT_TIME - LAST_RESTART))
    
    if [ $TIME_DIFF -lt 10 ]; then
        WAIT_TIME=$((10 - TIME_DIFF))
        echo "[FLOWSTACK] Waiting ${WAIT_TIME}s before restart to prevent rapid cycling..."
        sleep $WAIT_TIME
    fi
fi

# Update restart timestamp
date +%s > "$RESTART_DELAY_FILE"

# Set production environment
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-3001}
export ENABLE_ENTERPRISE=${ENABLE_ENTERPRISE:-true}

# Ensure license validation doesn't fail due to missing files
export FLOWISE_SKIP_OFFLINE_LICENSE_VERIFY=${FLOWISE_SKIP_OFFLINE_LICENSE_VERIFY:-true}

echo "[FLOWSTACK] Configuration:"
echo "  - Port: $PORT"
echo "  - Enterprise: $ENABLE_ENTERPRISE"
echo "  - Database: $DATABASE_TYPE"
echo "  - Database Host: $DATABASE_HOST:$DATABASE_PORT"

echo "[FLOWSTACK] Starting Flowise Enterprise on port $PORT..."

# Run directly without patches since we fixed the core code
cd /usr/src/core
exec node packages/server/bin/run start