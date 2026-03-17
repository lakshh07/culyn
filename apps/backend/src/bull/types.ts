import type { ScrapedData } from '@/lib/source-scrapers/types'

export type ContentImportJobData = {
  userId: string
  organizationId: string
  url: string
  /** Pre-scraped data passed from the instagram-scrape worker. Skips the scrape step. */
  scrapedData?: ScrapedData
}

export type ContentImportJobResult = {
  category: 'RECIPE' | 'PLACE' | 'PRODUCT'
  slug: string
  recordId: string
  success: boolean
  error?: string
}

export type InstagramScrapeJobData = {
  userId: string
  organizationId: string
  url: string
  contentImportBullJobId: string
}

export type InstagramScrapeJobResult = {
  success: boolean
  postId: string
  error?: string
}
