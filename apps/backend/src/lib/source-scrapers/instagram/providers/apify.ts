import type { ScrapedData } from '../../types'

const ACTOR_ID = 'apify~instagram-scraper'

interface ApifyItem {
  caption?: string
  displayUrl?: string
  images?: string[]
  videoUrl?: string
  ownerUsername?: string
  ownerFullName?: string
  type?: string
  url?: string
}

export async function scrapeViaApify(url: string): Promise<ScrapedData> {
  const apiKey = process.env.APIFY_API_KEY
  if (!apiKey) {
    throw new Error('APIFY_API_KEY env var not set')
  }

  const endpoint = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${apiKey}&timeout=120`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ directUrls: [url] }),
  })

  if (!response.ok) {
    throw new Error(`Apify API returned ${response.status}`)
  }

  const items = (await response.json()) as ApifyItem[]

  if (!items.length) {
    throw new Error('Apify returned no items for URL')
  }

  const item = items[0]!
  return {
    caption: item.caption ?? '',
    displayUrl: item.displayUrl,
    ownerUsername: item.ownerUsername ?? '',
    videoUrl: item.videoUrl,
  }
}
