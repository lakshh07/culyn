import { RecipeSourceType } from '@/generated/prisma/enums'
import { BaseRecipeSourceData, ProcessedRecipeSource } from './types'

/**
 * Abstract base class for recipe source handlers
 * Each source type (Instagram, YouTube, TikTok, etc.) should implement this interface
 */
export abstract class RecipeSourceHandler<T extends BaseRecipeSourceData = BaseRecipeSourceData> {
  /**
   * The type of source this handler processes
   */
  abstract readonly sourceType: RecipeSourceType

  /**
   * Fetch and process source data from a URL
   * @param url Source URL (e.g., Instagram post URL, YouTube URL)
   * @returns Processed source data and media
   */
  abstract fetchSourceData(url: string): Promise<ProcessedRecipeSource<T>>

  /**
   * Validate if a URL is supported by this handler
   * @param url URL to validate
   * @returns True if URL is supported
   */
  abstract isValidUrl(url: string): boolean

  /**
   * Get the display name for this source type
   */
  abstract getDisplayName(): string
}
