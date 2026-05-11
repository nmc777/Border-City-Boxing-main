FROM node:20-slim as builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies with npm
RUN echo "📦 Installing frontend dependencies..." && \
    npm install 2>&1 && \
    echo "✅ Dependencies installed"

# Copy source
COPY src ./src
COPY index.html vite.config.ts tsconfig.json tsconfig.node.json ./

# Build frontend with error output
RUN echo "🔨 Building frontend..." && \
    npm run build 2>&1 || (echo "❌ Build failed, showing details:" && exit 1) && \
    if [ ! -d dist ]; then echo "❌ ERROR: dist directory not created"; exit 1; fi && \
    echo "✅ Frontend build successful"

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
