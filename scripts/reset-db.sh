#!/bin/bash

# Script to reset FlowStack database for fresh migration

echo "⚠️  WARNING: This will DROP and recreate the FlowStack database!"
echo "All data will be lost. Use this only for development/testing."
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirmation

if [ "$confirmation" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set defaults if not provided
DB_HOST=${DATABASE_HOST:-localhost}
DB_PORT=${DATABASE_PORT:-5432}
DB_NAME=${DATABASE_NAME:-flowstack}
DB_USER=${DATABASE_USER:-flowstack_admin}
DB_PASSWORD=${DATABASE_PASSWORD:-ChangeMe123!@#}

echo "Connecting to PostgreSQL at $DB_HOST:$DB_PORT"

# Drop and recreate database
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;
EOF

echo "✅ Database reset complete. The database is now empty and ready for fresh migrations."
echo ""
echo "You can now start the application and migrations will run automatically." 