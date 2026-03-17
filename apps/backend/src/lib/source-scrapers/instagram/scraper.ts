import { getRedis } from '@/lib/redis'
import type { ScrapedData } from '../types'
import { scrapeViaApify } from './providers/apify'
import { IgNotFoundError, IgRateLimitError, scrapeViaGraphQL } from './providers/graphql'

const CACHE_TTL_SECONDS = 3600 // 1 hour

export function extractPostId(url: string): string | null {
  const regex = /instagram.com\/(?:[A-Za-z0-9_.]+\/)?(p|reels|reel|stories)\/([A-Za-z0-9-_]+)/
  const match = url.match(regex)
  return match && match[2] ? match[2] : null
}

export function isInstagramUrl(url: string): boolean {
  return /instagram\.com\/(p|reels|reel|stories)\//.test(url)
}

export async function getInstagramPostData(url: string): Promise<ScrapedData> {
  const postId = extractPostId(url)
  if (!postId) throw new Error('Invalid Instagram URL')

  const redis = await getRedis()
  const cacheKey = `ig:scraped:${postId}`

  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached) as ScrapedData
  }

  const provider = process.env.IG_SCRAPER_PROVIDER ?? 'internal'
  let scraped: ScrapedData

  if (provider === 'apify') {
    scraped = await scrapeViaApify(url)
  } else {
    try {
      scraped = await scrapeViaGraphQL(postId)
    } catch (err) {
      // Post is gone — don't waste an Apify call, fail immediately
      if (err instanceof IgNotFoundError) throw err

      // Instagram rate-limited our IP — go straight to Apify, no retry
      if (err instanceof IgRateLimitError) {
        console.warn('[IGScraper] Rate limited by Instagram, falling back to Apify')
        scraped = await scrapeViaApify(url)
      } else {
        const message = err instanceof Error ? err.message : String(err)
        console.warn(`[IGScraper] Internal strategy failed (${message}), falling back to Apify`)
        scraped = await scrapeViaApify(url)
      }
    }
  }

  await redis.set(cacheKey, JSON.stringify(scraped), { EX: CACHE_TTL_SECONDS })

  return scraped
}
