import { getRedis } from '@/lib/redis'
import type { ScrapedData } from '../../types'

// ── Custom error classes ──────────────────────────────────────────────────────

export class IgRateLimitError extends Error {
  constructor() {
    super('Instagram rate limit hit (429)')
    this.name = 'IgRateLimitError'
  }
}

export class IgNotFoundError extends Error {
  constructor(postId: string) {
    super(`Instagram post not found: ${postId}`)
    this.name = 'IgNotFoundError'
  }
}

export class IgAuthError extends Error {
  constructor(status: number) {
    super(`Instagram auth error (${status}) — lsd token likely expired`)
    this.name = 'IgAuthError'
  }
}

// ── User-Agent pool ───────────────────────────────────────────────────────────

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
]

function pickUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]!
}

// ── Dynamic lsd token ─────────────────────────────────────────────────────────

const LSD_CACHE_KEY = 'ig:lsd:token'
const LSD_CACHE_TTL = 300 // 5 minutes

async function fetchLsdToken(): Promise<string> {
  const redis = await getRedis()

  const cached = await redis.get(LSD_CACHE_KEY)
  if (cached) return cached

  const response = await fetch('https://www.instagram.com/', {
    headers: {
      'User-Agent': pickUserAgent(),
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch Instagram homepage: ${response.status}`)
  }

  const html = await response.text()
  const token = /"token":"([^"]+)"/.exec(html)?.[1]

  if (!token) {
    throw new Error('Could not extract lsd token from Instagram homepage')
  }

  await redis.set(LSD_CACHE_KEY, token, { EX: LSD_CACHE_TTL })
  return token
}

async function invalidateLsdToken(): Promise<void> {
  const redis = await getRedis()
  await redis.del(LSD_CACHE_KEY)
}

// ── GraphQL response shape ────────────────────────────────────────────────────

interface InstagramMediaResponse {
  data?: {
    xdt_shortcode_media?: {
      edge_media_to_caption?: {
        edges?: Array<{
          node?: { text?: string }
        }>
      }
      display_url?: string
      owner?: { username?: string }
      video_url?: string
    }
  }
}

// ── Core scrape function ──────────────────────────────────────────────────────

const DOC_ID = process.env.IG_DOC_ID ?? '10015901848480474'
const X_IG_APP_ID = process.env.X_IG_APP_ID

async function doGraphQLRequest(postId: string, lsd: string): Promise<ScrapedData> {
  if (!X_IG_APP_ID) {
    throw new Error('Instagram scraper env var missing: X_IG_APP_ID')
  }

  const ua = pickUserAgent()

  const graphqlUrl = new URL('https://www.instagram.com/api/graphql')
  graphqlUrl.searchParams.set('variables', JSON.stringify({ shortcode: postId }))
  graphqlUrl.searchParams.set('doc_id', DOC_ID)
  graphqlUrl.searchParams.set('lsd', lsd)

  const headers: Record<string, string> = {
    'User-Agent': ua,
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-IG-App-ID': X_IG_APP_ID,
    'X-FB-LSD': lsd,
    'X-ASBD-ID': '129477',
    'Sec-Fetch-Site': 'same-origin',
  }

  if (process.env.IG_SESSION_COOKIE) {
    headers['Cookie'] = `sessionid=${process.env.IG_SESSION_COOKIE}`
  }

  const response = await fetch(graphqlUrl, { method: 'POST', headers })

  if (response.status === 429) throw new IgRateLimitError()
  if (response.status === 404) throw new IgNotFoundError(postId)
  if (response.status === 400 || response.status === 403) throw new IgAuthError(response.status)

  if (!response.ok) {
    throw new Error(`Instagram GraphQL returned ${response.status}`)
  }

  const json = (await response.json()) as InstagramMediaResponse
  const media = json?.data?.xdt_shortcode_media

  if (!media) {
    throw new Error('No media data in GraphQL response')
  }

  return {
    caption: media.edge_media_to_caption?.edges?.[0]?.node?.text ?? '',
    displayUrl: media.display_url,
    ownerUsername: media.owner?.username ?? '',
    videoUrl: media.video_url,
  }
}

// ── Public entry point ────────────────────────────────────────────────────────

export async function scrapeViaGraphQL(postId: string): Promise<ScrapedData> {
  const lsd = await fetchLsdToken()

  try {
    return await doGraphQLRequest(postId, lsd)
  } catch (err) {
    if (err instanceof IgAuthError) {
      // Token was stale — invalidate cache, fetch fresh, retry once
      console.warn('[IGScraper/GraphQL] Auth error, refreshing lsd token and retrying')
      await invalidateLsdToken()
      const freshLsd = await fetchLsdToken()
      return await doGraphQLRequest(postId, freshLsd)
    }
    // IgRateLimitError and IgNotFoundError propagate as-is
    throw err
  }
}
