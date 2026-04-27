#!/bin/sh
set -e

echo "Starting nginx..."
nginx

echo "Starting API server on port ${PORT:-3000}..."
exec node --enable-source-maps artifacts/api-server/dist/index.mjs
