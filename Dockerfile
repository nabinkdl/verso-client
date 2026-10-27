# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=development

# Install the workspace dependency graph from the lockfile only.
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/ui/package.json ./apps/ui/package.json
RUN npm ci

# Build the UI and the API.
FROM deps AS builder
COPY apps/backend ./apps/backend
COPY apps/ui ./apps/ui
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build?schema=public
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build --workspace @mononet/ui
RUN npm run build --workspace @mononet/backend

# Single runtime image: Node serves the compiled API + built UI on one port.
FROM base AS runner
ENV NODE_ENV=production \
    PRISMA_SKIP_POSTINSTALL_GENERATE=true
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/ui/package.json ./apps/ui/package.json
RUN npm ci --omit=dev
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/apps/ui/dist ./apps/backend/public
WORKDIR /app/apps/backend
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null 2>&1 || exit 1
CMD ["node", "dist/main.js"]
