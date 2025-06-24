#!/bin/sh
# Ultimate debugging script for flowise-core startup issues

echo "[DEBUG-FLOWISE] ========================================"
echo "[DEBUG-FLOWISE] FLOWISE DEBUG SCRIPT STARTED AT $(date)"
echo "[DEBUG-FLOWISE] ========================================"

# Write to multiple log files to ensure we capture something
exec > >(tee -a /tmp/flowise-debug-all.log) 2>&1

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "[DEBUG-FLOWISE] Starting comprehensive debug..."
log "[DEBUG-FLOWISE] Environment variables:"
env | sort

# Check if we're in Docker
if [ -f /.dockerenv ]; then
    log "[DEBUG-FLOWISE] Running inside Docker container"
else
    log "[DEBUG-FLOWISE] Running on host system"
fi

# Check Node.js
log "[DEBUG-FLOWISE] Checking Node.js..."
which node || log "[ERROR] Node not found!"
node --version || log "[ERROR] Cannot run node --version"

# Check file system
log "[DEBUG-FLOWISE] Checking file system..."
log "[DEBUG-FLOWISE] Current directory: $(pwd)"
log "[DEBUG-FLOWISE] Contents of /usr/src:"
ls -la /usr/src/ 2>/dev/null || log "[ERROR] Cannot list /usr/src"

log "[DEBUG-FLOWISE] Contents of /usr/src/core:"
ls -la /usr/src/core/ 2>/dev/null || log "[ERROR] Cannot list /usr/src/core"

log "[DEBUG-FLOWISE] Checking for flowise executable:"
find /usr/src -name "run" -type f 2>/dev/null | head -10

# Try running node directly
log "[DEBUG-FLOWISE] Testing Node.js with simple script..."
node -e "console.log('[NODE-TEST] Node is working')" || log "[ERROR] Node execution failed"

# Check if we can access the flowise run script
if [ -f "/usr/src/core/packages/server/bin/run" ]; then
    log "[DEBUG-FLOWISE] Found run script, checking permissions:"
    ls -la /usr/src/core/packages/server/bin/run
    
    log "[DEBUG-FLOWISE] First 20 lines of run script:"
    head -20 /usr/src/core/packages/server/bin/run
    
    # Try to run it with node directly
    log "[DEBUG-FLOWISE] Attempting to run with node directly..."
    cd /usr/src/core
    node packages/server/bin/run --version 2>&1 || log "[ERROR] Direct node execution failed"
    
    # Try with explicit environment
    log "[DEBUG-FLOWISE] Attempting with explicit environment..."
    PORT=3001 node packages/server/bin/run start 2>&1 &
    FLOWISE_PID=$!
    
    # Wait a bit and check if it's still running
    sleep 5
    if kill -0 $FLOWISE_PID 2>/dev/null; then
        log "[DEBUG-FLOWISE] Process is still running after 5 seconds"
        kill $FLOWISE_PID
    else
        log "[ERROR] Process died within 5 seconds"
        wait $FLOWISE_PID
        EXIT_CODE=$?
        log "[ERROR] Exit code: $EXIT_CODE"
    fi
else
    log "[ERROR] Run script not found at expected location"
fi

# Check for core dumps or system errors
log "[DEBUG-FLOWISE] Checking for system errors..."
dmesg | tail -20 2>/dev/null || log "[INFO] Cannot read dmesg (normal in Docker)"

# Check memory
log "[DEBUG-FLOWISE] Memory info:"
free -h 2>/dev/null || log "[INFO] Cannot run free command"

# Final test with strace if available
if command -v strace >/dev/null 2>&1; then
    log "[DEBUG-FLOWISE] Running with strace to capture system calls..."
    cd /usr/src/core
    strace -f -e trace=open,openat,execve -o /tmp/flowise-strace.log node packages/server/bin/run start 2>&1 &
    STRACE_PID=$!
    sleep 3
    kill $STRACE_PID 2>/dev/null
    log "[DEBUG-FLOWISE] Strace output (last 50 lines):"
    tail -50 /tmp/flowise-strace.log 2>/dev/null
fi

log "[DEBUG-FLOWISE] Debug script completed"