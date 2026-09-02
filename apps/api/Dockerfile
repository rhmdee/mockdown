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
COPY apps/api/package.json ./apps/api/

# Install dependencies for the monorepo
RUN bun install --frozen-lockfile || bun install

# Copy source code
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Build API bundle
WORKDIR /app/apps/api
RUN bun build src/index.ts --target bun --outdir dist

# Production runner stage
FROM oven/bun:1-alpine AS runner
WORKDIR /app

COPY --from=base /app/apps/api/dist/index.js ./index.js

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["bun", "run", "index.js"]
