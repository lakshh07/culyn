import { RecipeSourceType } from '@culyn/shared/types'

/**
 * Base interface for recipe source data
 * Each source type should extend this with additional fields as needed
 */
export interface BaseRecipeSourceData {
  caption: string
  ownerUsername: string
  sourceType: RecipeSourceType
  [key: string]: unknown // Allow additional properties
}

/**
 * Instagram-specific source data
 */
export interface InstagramRecipeSourceData extends BaseRecipeSourceData {
  sourceType: typeof RecipeSourceType.INSTAGRAM_REEL
  videoUrl: string
  displayUrl: string
}

/**
 * Media assets fetched from a recipe source
 */
export interface RecipeSourceMedia {
  video?: {
    buffer: Buffer
    url: string
  }
  thumbnail?: {
    buffer: Buffer
    url: string
  }
  images?: Array<{
    buffer: Buffer
    url: string
  }>
}

/**
 * Result of processing a recipe source
 */
export interface ProcessedRecipeSource<T extends BaseRecipeSourceData = BaseRecipeSourceData> {
  sourceData: T
  media: RecipeSourceMedia
}
