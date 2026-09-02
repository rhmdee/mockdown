# Base image with Bun runtime
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Install build dependencies
COPY package.json turbo.json bun.lock* ./
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/schema/package.json ./packages/schema/
COPY packages/parser-core/package.json ./packages/parser-core/
COPY packages/mock-engine/package.json ./packages/mock-engine/
COPY packages/prisma-generator/package.json ./packages/prisma-generator/
COPY apps/web/package.json ./apps/web/

# Install dependencies for the monorepo
RUN bun install --frozen-lockfile || bun install

# Copy source code
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

# Build Web bundle
WORKDIR /app/apps/web
RUN bun run build

# Production stage using Nginx
FROM nginx:alpine AS runner
COPY --from=base /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
