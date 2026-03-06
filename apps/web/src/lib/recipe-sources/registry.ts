import { RecipeSourceType } from '@culyn/shared/types'
import { RecipeSourceHandler } from '@/lib/recipe-sources/base'
import { InstagramReelsRecipeSourceHandler } from '@/lib/recipe-sources/instagram/reels'

/**
 * Registry of all available recipe source handlers
 * Add new handlers here to support additional source types
 */
class RecipeSourceRegistry {
  private handlers: Map<RecipeSourceType, RecipeSourceHandler>

  constructor() {
    this.handlers = new Map()
    this.registerDefaultHandlers()
  }

  /**
   * Register default source handlers
   */
  private registerDefaultHandlers() {
    this.register(new InstagramReelsRecipeSourceHandler())
  }

  /**
   * Register a new source handler
   */
  register(handler: RecipeSourceHandler): void {
    this.handlers.set(handler.sourceType, handler)
  }

  /**
   * Get handler for a specific source type
   */
  getHandler(sourceType: RecipeSourceType): RecipeSourceHandler {
    const handler = this.handlers.get(sourceType)
    if (!handler) {
      throw new Error(`No handler registered for source type: ${sourceType}`)
    }
    return handler
  }

  /**
   * Get handler by URL (auto-detect source type)
   */
  getHandlerByUrl(url: string): RecipeSourceHandler {
    for (const handler of this.handlers.values()) {
      if (handler.isValidUrl(url)) {
        return handler
      }
    }
    throw new Error(`No handler found for URL: ${url}`)
  }

  /**
   * Get all registered handlers
   */
  getAllHandlers(): RecipeSourceHandler[] {
    return Array.from(this.handlers.values())
  }

  /**
   * Get all supported source types
   */
  getSupportedSourceTypes(): RecipeSourceType[] {
    return Array.from(this.handlers.keys())
  }

  /**
   * Check if a source type is supported
   */
  isSupported(sourceType: RecipeSourceType): boolean {
    return this.handlers.has(sourceType)
  }
}

/**
 * Singleton instance of the registry
 */
export const recipeSourceRegistry = new RecipeSourceRegistry()
