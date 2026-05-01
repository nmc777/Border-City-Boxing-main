#!/bin/bash
set -e

export PORT=5000
export BASE_PATH=/
export API_PORT=8080

# Build and start the API server in background
echo "Building and starting API server on port $API_PORT..."
cd /home/runner/workspace/artifacts/api-server
PORT=$API_PORT NODE_ENV=development pnpm run dev &
API_PID=$!

# Give API server time to start
sleep 3

# Start the frontend
echo "Starting frontend on port $PORT..."
cd /home/runner/workspace/artifacts/boxing-club
PORT=$PORT BASE_PATH=$BASE_PATH pnpm run dev

# If frontend exits, kill the API server
kill $API_PID 2>/dev/null || true
