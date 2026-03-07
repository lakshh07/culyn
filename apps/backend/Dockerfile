FROM oven/bun:1.3.10-alpine AS base
WORKDIR /app

# Copy workspace manifests (all apps needed for bun workspace resolution)
COPY package.json bun.lock* ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/mobile/package.json ./apps/mobile/package.json
COPY apps/web/package.json ./apps/web/package.json

# Install workspace dependencies (includes devDeps for prisma CLI)
RUN bun install --frozen-lockfile

# Copy source files
COPY packages/shared/ ./packages/shared/
COPY apps/backend/ ./apps/backend/

WORKDIR /app/apps/backend

# Generate Prisma client at build time (dummy URL — generate doesn't connect to DB)
RUN DATABASE_URL="postgresql://x:x@localhost/x" bunx prisma generate

EXPOSE 8000

# Default CMD (overridden per service in render.yaml)
CMD bun run src/index.ts
