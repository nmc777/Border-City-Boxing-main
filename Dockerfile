# ============================================================
# Border City Boxing — Production Dockerfile
# ============================================================

FROM node:20-slim AS base
RUN npm install -g pnpm

# ---- Install dependencies ----
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml .npmrc package.json ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/boxing-club/package.json ./artifacts/boxing-club/
COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/replit-auth-web/package.json ./lib/replit-auth-web/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY scripts/package.json ./scripts/
RUN pnpm install --frozen-lockfile

# ---- DB migration stage (used as one-shot service in docker-compose) ----
FROM deps AS migrate
WORKDIR /app
COPY . .
CMD ["pnpm", "--filter", "@workspace/db", "run", "push"]

# ---- Build backend ----
FROM deps AS build-api
WORKDIR /app
COPY . .
RUN pnpm --filter @workspace/api-server run build

# ---- Build frontend ----
FROM deps AS build-frontend
WORKDIR /app
COPY . .
ARG BASE_PATH=/
ENV BASE_PATH=$BASE_PATH
RUN pnpm --filter @workspace/boxing-club run build

# ---- Production image ----
FROM node:20-alpine AS production
WORKDIR /app

RUN apk add --no-cache nginx tini

# Copy compiled API server and its runtime dependencies
COPY --from=build-api /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=build-api /app/node_modules ./node_modules
COPY --from=build-api /app/artifacts/api-server/node_modules ./artifacts/api-server/node_modules

# Copy built frontend static files
COPY --from=build-frontend /app/artifacts/boxing-club/dist/public ./artifacts/boxing-club/dist/public

# Nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Startup script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 80

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/docker-entrypoint.sh"]
