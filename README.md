<div align="center">

# Culyn

**Turn food reels into recipes you can actually cook.**

Share an Instagram reel or post to Culyn and AI pulls out the recipe, restaurant, or product, then saves it to your library.

[Website](https://culyn.vercel.app) · [Backend](apps/backend) · [Mobile](apps/mobile) · [Web](apps/web)

</div>

---

## What it does

You save food reels all the time and never look at them again. Culyn turns them into something you can use:

- **Import from anywhere.** Paste a link, or use the iOS Share Sheet straight from Instagram. Culyn downloads the media and works out whether the post is a **recipe**, a **place**, or a **product**.
- **Structured recipes.** Ingredients with quantities, step-by-step instructions, timings, difficulty, tags, and a consistent AI-generated cover image.
- **Places and products.** Restaurants and cafés are geocoded and shown on a map. Grocery products are filed by category.
- **Library and cookbook.** Everything you import in one place, with favourites, ratings, and tags.
- **Shopping lists.** Add a recipe's ingredients to a grocery list in one tap.
- **AI chat.** Ask questions about a recipe, swap ingredients, or get suggestions that respect your dietary preferences (vegan, keto, halal, gluten-free, and more).
- **Plans.** Free tier with import and AI-credit limits; Pro subscription through Razorpay.

## Architecture

```
┌──────────────┐     share / paste link      ┌──────────────────────┐
│  Mobile app  │ ──────────────────────────▶ │   Backend API (Hono)  │
│ Expo + share │ ◀──── poll job status ───── │   /v1/*  Better Auth  │
│  extension   │                             └──────────┬───────────┘
└──────────────┘                                        │ enqueue
                                                        ▼
┌──────────────┐                             ┌──────────────────────┐
│   Web app    │                             │  BullMQ worker       │
│  Next.js     │                             │  scrape → classify → │
│ landing+admin│                             │  extract → image     │
└──────────────┘                             └──────────┬───────────┘
                                                        │
                        PostgreSQL (Prisma) · Redis · S3 · Gemini / OpenAI
```

**How an import works**

1. The client sends a URL (or data the share extension already scraped) to `POST /v1/content`.
2. The API creates a `Job` row and pushes it onto a BullMQ queue.
3. The worker detects the platform, scrapes the post (Instagram GraphQL with an Apify fallback), and downloads the media.
4. An LLM classifies the content as `RECIPE`, `PLACE`, or `PRODUCT` and extracts structured data that is validated with Zod.
5. Recipes get a generated cover image (Gemini image model, using plate/bowl/jar reference shots). Places are geocoded with Google Maps. Media goes to S3.
6. The client polls the job until it finishes, then the item shows up in the library.

## Tech stack

| Area           | Tools                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------- |
| **Monorepo**   | Bun workspaces, shared TypeScript package (`@culyn/shared`)                               |
| **Mobile**     | Expo 54, React Native 0.81, Expo Router, NativeWind, TanStack Query, Zustand, iOS share extension |
| **Web**        | Next.js 16, React 19, Tailwind CSS 4, Radix UI, Motion                                    |
| **Backend**    | Bun, Hono, Prisma 7, PostgreSQL, BullMQ + Redis, Zod                                      |
| **AI**         | Google Gemini 2.5 Flash (extraction and images), OpenAI GPT-4o-mini (chat), Vercel AI SDK |
| **Auth**       | Better Auth: Google, Apple, passkeys, API keys                                            |
| **Payments**   | Razorpay subscriptions                                                                    |
| **Infra**      | Docker, Railway (API and worker), Vercel (web), EAS (mobile), S3-compatible storage       |

## Project structure

```
culyn/
├── apps/
│   ├── backend/        # Hono API + BullMQ workers + Prisma schema
│   │   ├── prisma/
│   │   └── src/
│   │       ├── routes/v1/          # recipes, places, products, library, chat, lists, ...
│   │       ├── bull/               # queues + workers (content import, Instagram scrape)
│   │       └── lib/
│   │           ├── services/       # recipe / place / product AI + persistence
│   │           └── source-scrapers/
│   ├── mobile/         # Expo app (tabs: discover, library, add, AI chat, profile)
│   └── web/            # Next.js landing page + admin
└── packages/
    └── shared/         # Shared types, Zod schemas, utilities
```

## Getting started

### Prerequisites

- [Bun](https://bun.sh) `1.3.10`
- PostgreSQL
- Redis
- An S3-compatible bucket
- API keys: Gemini, OpenAI, Google Maps, Google/Apple OAuth, Razorpay, Apify (optional)
- Xcode (for iOS) or Android Studio

### Install

```bash
git clone https://github.com/lakshh07/culyn.git
cd culyn
bun install
```

### Configure

Create `apps/backend/.env`. Every variable is listed in [`apps/backend/src/types/env.d.ts`](apps/backend/src/types/env.d.ts):

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/culyn
REDIS_URL=redis://localhost:6379

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

GEMINI_API_KEY=
OPENAI_API_KEY=
GOOGLE_MAPS_API_KEY=

AWS_S3_BUCKET=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_PUBLIC_URL_BASE=

# Optional: social sign-in, payments, scraping
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_SERVICE_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_PLAN_ID_PRO=
APIFY_API_KEY=
```

For the mobile app, set `EXPO_PUBLIC_CULYN_API_URL` in `apps/mobile/.env`.

### Database

```bash
cd apps/backend
bunx prisma migrate dev
bun run seed:sample   # optional: sample places & products
```

### Run

```bash
# from the repo root
bun run dev:backend           # API with hot reload
bun --cwd apps/backend src/worker.ts   # import worker
bun run dev:web               # Next.js
bun run dev:mobile:ios        # Expo dev build on iOS
```

> The share extension needs a native build (`expo run:ios` or EAS). It does not work in Expo Go.

## Scripts

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `bun run dev`       | Start every app in parallel        |
| `bun run build`     | Build every app                    |
| `bun run typecheck` | Type-check every workspace         |
| `bun run lint`      | Lint every workspace               |
| `bun run format`    | Format with Prettier               |

## Deployment

- **Backend API and worker:** Docker image from [`apps/backend/Dockerfile`](apps/backend/Dockerfile), deployed on Railway ([`railway.json`](railway.json)). PM2 config is in `ecosystem.config.js`.
- **Web:** Vercel.
- **Mobile:** EAS Build and TestFlight. See [`apps/mobile/README.md`](apps/mobile/README.md).

CI runs type checks, lint, format, and Prisma validation on every PR to `main` and `production`. PR titles must follow Conventional Commits.

## Roadmap

- [x] Instagram reels and posts import
- [x] iOS share extension
- [x] AI chat with dietary preferences
- [ ] TikTok and YouTube Shorts import
- [ ] Meal planning
- [ ] Android share intent

## License

**Proprietary. All rights reserved.** © 2025-2026 [Lakshay Maini](https://github.com/lakshh07)

The code is public so you can look at it. You may not copy, modify, distribute, or use it without written permission. See [LICENSE](LICENSE) for details, and ask on GitHub if you want to use any part of it.
