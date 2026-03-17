import type { ConnectionOptions } from 'bullmq'

export const QUEUE_NAMES = {
  CONTENT_IMPORT: 'content-import',
  INSTAGRAM_SCRAPE: 'instagram-scrape',
} as const

export const connectionOptions: ConnectionOptions = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  maxRetriesPerRequest: null,
}

export const defaultJobOptions = {
  attempts: 2,
  backoff: {
    type: 'exponential' as const,
    delay: 4000,
  },
  removeOnComplete: {
    age: 24 * 3600, // Keep completed jobs for 24 hours
    count: 1000, // Keep max 1000 completed jobs
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // Keep failed jobs for 7 days
  },
}

export const workerOptions = {
  concurrency: 5, // Process up to 5 jobs concurrently
  lockDuration: 300000, // Lock jobs for 5 minutes
}

export const instagramScrapeRateLimiter = {
  max: Number(process.env.IG_RATE_LIMIT_MAX ?? 10),
  duration: Number(process.env.IG_RATE_LIMIT_DURATION ?? 60_000),
}

export const scrapeJobOptions = {
  attempts: 1, // Internal→Apify fallback is handled in-worker, not via retries
  removeOnComplete: { age: 3600, count: 500 },
  removeOnFail: { age: 24 * 3600 },
}
