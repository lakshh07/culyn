import type { SourcePlatform } from '@prisma/client'
import type { DownloadedMedia, ScrapedData } from './types'
import { getInstagramPostData, isInstagramUrl } from './instagram'
import { downloadInstagramMedia } from './instagram'

export type { ScrapedData, DownloadedMedia }

/**
 * Detect source platform from URL pattern
 */
export function detectSourcePlatform(url: string): SourcePlatform {
  const lower = url.toLowerCase()

  if (lower.includes('instagram.com/reel')) return 'INSTAGRAM_REEL'
  if (lower.includes('instagram.com/p/')) return 'INSTAGRAM_POST'
  if (lower.includes('instagram.com/tv/') || lower.includes('instagram.com/video/'))
    return 'INSTAGRAM_VIDEO'
  if (lower.includes('tiktok.com')) return 'TIKTOK'
  if (lower.includes('youtube.com/shorts') || lower.includes('youtu.be')) return 'YOUTUBE_SHORT'

  return 'MANUAL'
}

/**
 * Scrape and download media from a URL based on platform
 */
export async function scrapeAndDownload(
  url: string,
  platform: SourcePlatform
): Promise<{ scraped: ScrapedData; media: DownloadedMedia }> {
  switch (platform) {
    case 'INSTAGRAM_REEL':
    case 'INSTAGRAM_POST':
    case 'INSTAGRAM_VIDEO': {
      if (!isInstagramUrl(url)) {
        throw new Error('Invalid Instagram URL')
      }
      const scraped = await getInstagramPostData(url)
      const media = await downloadInstagramMedia(scraped)
      return { scraped, media }
    }
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}
