# Culyn Backend API

A standalone Bun + Hono backend for the Culyn recipe management platform.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth
- **Queue**: BullMQ with Redis
- **Storage**: AWS S3
- **Validation**: Zod

## Getting Started

### Prerequisites

- Bun installed (https://bun.sh)
- PostgreSQL database
- Redis server (for BullMQ)
- AWS S3 bucket (for media storage)

### Installation

1. Install dependencies:

```bash
cd apps/backend
bun install
```

2. Set up environment variables:
   Create a `.env` file in the backend directory with:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/culyn"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:8000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-bucket-name"
REDIS_URL="redis://localhost:6379"
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-key"
NODE_ENV="development"
```

3. Generate Prisma client:

```bash
bunx prisma generate
```

4. Run database migrations (if needed):

```bash
bunx prisma migrate deploy
```

### Development

Start the development server with hot reload:

```bash
bun run dev
```

The API will be available at `http://localhost:8000`

### Authentication

The API supports two authentication methods:

1. **Better Auth Sessions** (Cookie-based) - for web/mobile apps
2. **API Keys** - for server-to-server integrations, CLIs, scripts

See [BETTER_AUTH.md](./BETTER_AUTH.md) for Better Auth setup and endpoints.
See [API_KEYS.md](./API_KEYS.md) for detailed API key documentation.

## API Routes

All routes are mounted under `/api/v1`:

- **Health Check**: `GET /api/v1/health`
- **API Keys**:
  - `GET /api/v1/api-keys` - List API keys
  - `POST /api/v1/api-keys` - Create new API key
  - `DELETE /api/v1/api-keys/:id` - Delete API key
- **Tags**: `GET /api/v1/tags`
- **Ingredients**: `GET /api/v1/ingredients`
- **Cookbook**: `GET /api/v1/cookbook`
- **User Stats**: `GET /api/v1/user/stats`
- **Recipes**:
  - `GET /api/v1/recipes` - List recipes with filters
  - `GET /api/v1/recipes/:slug` - Get recipe by slug
  - `POST /api/v1/recipes/generate` - Generate recipe from URL (async)
  - `POST /api/v1/recipes/:slug/cookbook` - Add to cookbook
  - `DELETE /api/v1/recipes/:slug/cookbook/:cookbookId` - Remove from cookbook
  - `DELETE /api/v1/recipes/:slug/lists/:listId` - Delete from list
  - `PATCH /api/v1/recipes/:slug/items/:itemId` - Update list item
- **Lists**:
  - `GET /api/v1/lists` - Get grocery lists
  - `POST /api/v1/lists` - Create/update grocery list
- **Jobs**: `POST /api/v1/jobs/batch` - Get job statuses
- **Admin**: `POST /api/v1/admin/recipes/:slug/image` - Generate recipe image (not yet implemented)

### Project Structure

```
apps/backend/
├── src/
│   ├── index.ts              # Main Hono app entry (port 8000)
│   ├── routes/
│   │   └── v1/              # v1 API routes
│   ├── middleware/          # Error handling, logging
│   ├── lib/                 # Prisma, auth, AWS helpers
│   ├── bull/                # BullMQ configuration and queues
│   └── types/               # TypeScript types
├── prisma/
│   └── schema.prisma        # Database schema
└── package.json
```

### Architecture

- **Error Handling**: Uses Hono's built-in `HTTPException` with global error handler
- **Authentication**: Better Auth with inline session checks (no middleware yet)
- **Validation**: Zod schemas for request validation
- **Database**: Prisma for type-safe database access
- **Queues**: BullMQ for async job processing (recipe generation)
- **Storage**: AWS S3 for recipe images and videos

### Shared Package

Types, schemas, and utilities are shared via `@culyn/shared` workspace package located at `packages/shared/`.

### Deferred Features

The following features remain in the web app for now:

- Authentication middleware (routes use inline auth checks)
- SubscriptionService (subscription limits)
- recipeImageService (recipe image generation)

## Frontend Integration

Update the frontend API client to use the backend:

1. Set environment variable in `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

2. The frontend API client will automatically use the backend URL.

## Development Workflow

Run both apps in separate terminals:

**Terminal 1: Backend (port 8000)**

```bash
cd apps/backend && bun run dev
```

**Terminal 2: Frontend (port 3000)**

```bash
cd apps/web && bun run dev
```

## Notes

- Port: **8000** (not 8080)
- CORS is configured for `http://localhost:3000` and `http://localhost:3001`
- All routes require authentication except health check
- Authentication via Better Auth sessions OR API keys
- Recipe generation is asynchronous using BullMQ
- Admin image generation route returns 501 (service not yet migrated)

## Quick Start with API Keys

```bash
# 1. Create an API key (requires authenticated session)
curl -X POST http://localhost:8000/api/v1/api-keys \
  -H "Cookie: better-auth.session_token=<your-session>" \
  -H "Content-Type: application/json" \
  -d '{"name":"My CLI","expiresInDays":90}'

# 2. Use the API key
export CULYN_API_KEY="culyn_abc123..."

# 3. Make API calls
curl -H "Authorization: Bearer $CULYN_API_KEY" \
  http://localhost:8000/api/v1/recipes
```
