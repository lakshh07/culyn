/**
 * Recipe Source Handlers
 *
 * This module provides a flexible, extensible system for handling different recipe sources
 * (Instagram, YouTube, TikTok, manual uploads, etc.)
 *
 * To add a new source type:
 * 1. Create a new handler class extending RecipeSourceHandler
 * 2. Implement the required methods (fetchSourceData, isValidUrl, getDisplayName)
 * 3. Register it in the registry (registry.ts)
 */

export * from './base'
export * from './types'
export * from './instagram/reels'
export * from './registry'
