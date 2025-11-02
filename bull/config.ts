import type { ConnectionOptions } from 'bullmq'

export const QUEUE_NAMES = {
  RECIPE_GENERATION: 'recipe-generation',
} as const

export const connectionOptions: ConnectionOptions = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  maxRetriesPerRequest: 5,
}

export const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 2000,
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
