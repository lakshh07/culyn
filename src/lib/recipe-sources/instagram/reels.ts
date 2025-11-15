import { RecipeSourceType } from '@/generated/prisma/enums'
import { getInstagramPostData } from '@/lib/recipe-sources/instagram/scraper'
import { RecipeSourceHandler } from '@/lib/recipe-sources/base'
import { InstagramRecipeSourceData, ProcessedRecipeSource } from '@/lib/recipe-sources/types'
import axios from 'axios'

/**
 * Handler for Instagram recipe sources (Reels)
 */
export class InstagramReelsRecipeSourceHandler extends RecipeSourceHandler<InstagramRecipeSourceData> {
  readonly sourceType = RecipeSourceType.INSTAGRAM_REEL

  async fetchSourceData(url: string): Promise<ProcessedRecipeSource<InstagramRecipeSourceData>> {
    const instagramData = await getInstagramPostData(url)

    if (!instagramData.videoUrl || !instagramData.displayUrl) {
      throw new Error('Instagram reel does not contain required video or thumbnail')
    }

    const [videoResponse, thumbnailResponse] = await Promise.all([
      axios.get(instagramData.videoUrl, { responseType: 'arraybuffer' }),
      axios.get(instagramData.displayUrl, { responseType: 'arraybuffer' }),
    ])

    const sourceData: InstagramRecipeSourceData = {
      caption: instagramData.caption,
      ownerUsername: instagramData.ownerUsername,
      videoUrl: instagramData.videoUrl,
      displayUrl: instagramData.displayUrl,
      sourceType: RecipeSourceType.INSTAGRAM_REEL,
    }

    return {
      sourceData,
      media: {
        video: {
          buffer: Buffer.from(videoResponse.data),
          url: instagramData.videoUrl,
        },
        thumbnail: {
          buffer: Buffer.from(thumbnailResponse.data),
          url: instagramData.displayUrl,
        },
      },
    }
  }

  isValidUrl(url: string): boolean {
    const instagramUrlPattern = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels)\/[a-zA-Z0-9_-]+/
    return instagramUrlPattern.test(url)
  }

  getDisplayName(): string {
    return 'Instagram Reel'
  }
}
