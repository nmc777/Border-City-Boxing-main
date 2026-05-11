FROM node:20-slim

WORKDIR /app

# Copy package files FIRST
COPY package.json ./

# Install dependencies with npm (built-in, more reliable than pnpm)
RUN echo "📦 Installing dependencies with npm..." && \
    npm install 2>&1 && \
    echo "✅ Dependencies installed"

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript
RUN echo "🔨 Compiling TypeScript..." && \
    npx tsc --version && \
    npx tsc && \
    echo "✅ TypeScript compilation complete"

# Verify build
RUN echo "🔍 Verifying build..." && \
    test -d dist || (echo "❌ ERROR: dist/ directory not created" && ls -la && exit 1) && \
    test -f dist/app.js || (echo "❌ ERROR: dist/app.js not found" && ls -la dist/ && exit 1) && \
    test -f dist/db/migrate.js || (echo "❌ ERROR: dist/db/migrate.js not found" && exit 1) && \
    echo "✅ Build verification passed"

# Copy entrypoint script
COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

# Expose port
EXPOSE 3001

# Start server via entrypoint
ENTRYPOINT ["./entrypoint.sh"]
