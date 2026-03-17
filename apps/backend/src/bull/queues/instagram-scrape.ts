import { connectionOptions, QUEUE_NAMES, scrapeJobOptions } from '@/bull/config'
import type { InstagramScrapeJobData, InstagramScrapeJobResult } from '@/bull/types'
import { Queue } from 'bullmq'

export const instagramScrapeQueue = new Queue<InstagramScrapeJobData, InstagramScrapeJobResult>(
  QUEUE_NAMES.INSTAGRAM_SCRAPE,
  {
    connection: connectionOptions,
    defaultJobOptions: scrapeJobOptions,
  }
)
