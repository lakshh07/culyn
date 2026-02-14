import type { ScrapedData } from '../types'

const USER_AGENT = process.env.USER_AGENT
const X_IG_APP_ID = process.env.X_IG_APP_ID

interface InstagramMediaResponse {
  data?: {
    xdt_shortcode_media?: {
      edge_media_to_caption?: {
        edges?: Array<{
          node?: {
            text?: string
          }
        }>
      }
      display_url?: string
      owner?: {
        username?: string
      }
      video_url?: string
    }
  }
}

/**
 * Extracts the post/reel ID from an Instagram URL
 */
export function extractPostId(url: string): string | null {
  const regex = /instagram.com\/(?:[A-Za-z0-9_.]+\/)?(p|reels|reel|stories)\/([A-Za-z0-9-_]+)/
  const match = url.match(regex)
  return match && match[2] ? match[2] : null
}

/**
 * Checks if a URL is an Instagram URL
 */
export function isInstagramUrl(url: string): boolean {
  return /instagram\.com\/(p|reels|reel|stories)\//.test(url)
}

/**
 * Fetches Instagram post data including caption, display URL, and owner username
 */
export async function getInstagramPostData(url: string): Promise<ScrapedData> {
  const postId = extractPostId(url)

  if (!postId) {
    throw new Error('Invalid Instagram URL')
  }

  if (!USER_AGENT || !X_IG_APP_ID) {
    throw new Error('Instagram scraper headers not found in ENV')
  }

  try {
    const graphqlUrl = new URL('https://www.instagram.com/api/graphql')
    graphqlUrl.searchParams.set('variables', JSON.stringify({ shortcode: postId }))
    graphqlUrl.searchParams.set('doc_id', '10015901848480474')
    graphqlUrl.searchParams.set('lsd', 'AVqbxe3J_YA')

    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-IG-App-ID': X_IG_APP_ID,
        'X-FB-LSD': 'AVqbxe3J_YA',
        'X-ASBD-ID': '129477',
        'Sec-Fetch-Site': 'same-origin',
      },
    })

    if (!response.ok) {
      throw new Error(`Instagram API returned status ${response.status}`)
    }

    const json = (await response.json()) as InstagramMediaResponse
    const media = json?.data?.xdt_shortcode_media

    if (!media) {
      throw new Error('No media data found in response')
    }

    const caption = media?.edge_media_to_caption?.edges?.[0]?.node?.text || ''
    const displayUrl = media?.display_url
    const ownerUsername = media?.owner?.username || ''
    const videoUrl = media?.video_url

    return {
      caption,
      displayUrl,
      ownerUsername,
      videoUrl,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch Instagram data: ${error.message}`)
    }
    throw new Error('Failed to fetch Instagram data: Unknown error')
  }
}
