#!/bin/sh

echo "🚀 Hermes Backend Startup"
echo "========================"

# Wait briefly for database to be ready
echo "⏳ Waiting for database..."
for i in 1 2 3 4 5 6; do
  if node dist/db/migrate.js 2>/dev/null; then
    echo "✅ Database migrations completed"
    break
  fi
  echo "   Attempt $i/6..."
  sleep 2
done

# Start the app (migrations will run on first request if needed)
echo "📱 Starting Hermes API..."
exec node dist/app.js
