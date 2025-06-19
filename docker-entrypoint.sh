#!/bin/sh
set -e

echo "🚀 Starting FlowStack..."

# Ensure log directories exist
mkdir -p /var/log/supervisor

# Set default environment variables if not provided
export FLOWISE_USERNAME=${FLOWISE_USERNAME:-hafiz@leadevs.com}
export FLOWISE_PASSWORD=${FLOWISE_PASSWORD:-Password1@#}
export DATABASE_TYPE=${DATABASE_TYPE:-postgres}

# PostgreSQL configuration
if [ "$DATABASE_TYPE" = "postgres" ]; then
    export DATABASE_HOST=${DATABASE_HOST:-localhost}
    export DATABASE_PORT=${DATABASE_PORT:-5432}
    export DATABASE_NAME=${DATABASE_NAME:-flowstack}
    export DATABASE_USER=${DATABASE_USER:-flowstack_admin}
    export DATABASE_PASSWORD=${DATABASE_PASSWORD:-ChangeMe123!@#}
    export DATABASE_SSL=${DATABASE_SSL:-false}
    export DATABASE_URL=${DATABASE_URL:-postgresql://flowstack_admin:ChangeMe123!@#@localhost:5432/flowstack}
    export DATABASE_PATH=${DATABASE_PATH:-/root/.flowise}
    
    echo "Configured for PostgreSQL:"
    echo "  Host: $DATABASE_HOST:$DATABASE_PORT"
    echo "  Database: $DATABASE_NAME"
    echo "  User: $DATABASE_USER"
    echo "  SSL: $DATABASE_SSL"
    
    # Wait for PostgreSQL to be ready
    echo "Waiting for PostgreSQL to be ready..."
    for i in $(seq 1 30); do
        if pg_isready -h "$DATABASE_HOST" -p "$DATABASE_PORT" -U "$DATABASE_USER" 2>/dev/null; then
            echo "PostgreSQL is ready!"
            break
        fi
        echo "Waiting for PostgreSQL... ($i/30)"
        sleep 2
    done
fi

# SQLite configuration (fallback)
if [ "$DATABASE_TYPE" = "sqlite" ]; then
    export DATABASE_PATH=${DATABASE_PATH:-/root/.flowise}
    mkdir -p $(dirname "$DATABASE_PATH")
    echo "Configured for SQLite: $DATABASE_PATH"
fi

# Wait a moment to ensure everything is ready
sleep 2

# Start supervisord
echo "Starting supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf 