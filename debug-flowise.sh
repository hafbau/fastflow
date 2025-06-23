#!/bin/bash
# Debug script to run flowise-core directly and capture error logs

echo "=== Testing flowise-core directly ==="

# Pull the latest image
docker pull leadevs/fastflow:latest

# Run the container with debugging enabled
docker run --rm -it \
  -e FLOWISE_USERNAME=test@example.com \
  -e FLOWISE_PASSWORD=testpass123 \
  -e DATABASE_TYPE=postgres \
  -e DATABASE_HOST=prod-flowstack-db.cmfqeqy02zcr.us-east-1.rds.amazonaws.com \
  -e DATABASE_PORT=5432 \
  -e DATABASE_NAME=flowstack \
  -e DATABASE_USER=flowstack_admin \
  -e DATABASE_PASSWORD=ChangeMe123 \
  -e DATABASE_SSL=true \
  -e PORT=3001 \
  leadevs/fastflow:latest \
  sh -c "cd /usr/src/core && ./packages/server/bin/run start"