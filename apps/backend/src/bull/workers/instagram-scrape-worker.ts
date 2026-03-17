import {
  connectionOptions,
  defaultJobOptions,
  instagramScrapeRateLimiter,
  QUEUE_NAMES,
} from '@/bull/config'
import type {
  ContentImportJobData,
  InstagramScrapeJobData,
  InstagramScrapeJobResult,
} from '@/bull/types'
import db from '@/lib/prisma'
import { extractPostId, getInstagramPostData } from '@/lib/source-scrapers/instagram/scraper'
import { JobStatus } from '@prisma/client'
import { Worker, type Job } from 'bullmq'
import { contentImportQueue } from '../queues/content-import'

async function processInstagramScrape(
  job: Job<InstagramScrapeJobData, InstagramScrapeJobResult>
): Promise<InstagramScrapeJobResult> {
  const { userId, organizationId, url, contentImportBullJobId } = job.data
  const postId = extractPostId(url) ?? url

  try {
    const scrapedData = await getInstagramPostData(url)

    await contentImportQueue.add(
      QUEUE_NAMES.CONTENT_IMPORT,
      { userId, organizationId, url, scrapedData } satisfies ContentImportJobData,
      { ...defaultJobOptions, jobId: contentImportBullJobId }
    )

    return { success: true, postId }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[InstagramScrape] Job failed:', error)

    await db.job.updateMany({
      where: { bullJobId: contentImportBullJobId },
      data: {
        status: JobStatus.FAILED,
        failedAt: new Date(),
        errorData: { message },
      },
    })

    return { success: false, postId, error: message }
  }
}

let instagramScrapeWorker: Worker<InstagramScrapeJobData, InstagramScrapeJobResult> | null = null

export function startInstagramScrapeWorker() {
  instagramScrapeWorker = new Worker<InstagramScrapeJobData, InstagramScrapeJobResult>(
    QUEUE_NAMES.INSTAGRAM_SCRAPE,
    processInstagramScrape,
    {
      connection: connectionOptions,
      concurrency: 3,
      limiter: instagramScrapeRateLimiter,
    }
  )

  instagramScrapeWorker.on('active', job => {
    console.log(`[InstagramScrape] Job ${job.id} started`)
  })

  instagramScrapeWorker.on('completed', job => {
    console.log(`[InstagramScrape] Job ${job.id} completed`)
  })

  instagramScrapeWorker.on('failed', (job, err) => {
    console.error(`[InstagramScrape] Job ${job?.id} failed:`, err.message)
  })

  return instagramScrapeWorker
}

export function stopInstagramScrapeWorker() {
  return instagramScrapeWorker?.close()
}
