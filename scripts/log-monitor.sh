#!/bin/sh
# Monitor debug log files and output their contents

while true; do
    echo "=================== LOG MONITOR - $(date) ==================="
    
    if [ -f /tmp/flowise-debug.log ]; then
        echo "Contents of /tmp/flowise-debug.log:"
        cat /tmp/flowise-debug.log
        echo "End of flowise-debug.log"
    else
        echo "/tmp/flowise-debug.log does not exist"
    fi
    
    if [ -f /tmp/flowise-wrapper.log ]; then
        echo "Contents of /tmp/flowise-wrapper.log:"
        tail -20 /tmp/flowise-wrapper.log
        echo "End of flowise-wrapper.log"
    else
        echo "/tmp/flowise-wrapper.log does not exist"
    fi
    
    if [ -f /tmp/flowise-simple.log ]; then
        echo "Contents of /tmp/flowise-simple.log:"
        tail -20 /tmp/flowise-simple.log
        echo "End of flowise-simple.log"
    else
        echo "/tmp/flowise-simple.log does not exist"
    fi
    
    echo "================= END LOG MONITOR ================="
    sleep 10
done