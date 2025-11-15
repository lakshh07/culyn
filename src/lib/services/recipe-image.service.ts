import { GoogleGenAI } from '@google/genai'
import { CreateRecipeRequest } from '@/schema/create-recipe'
import { trackAiUsage } from '@/lib/ai/usage'
import { AiProvider } from '@/lib/ai/types'

/**
 * Configuration for image generation
 */
const IMAGE_CONFIG = Object.freeze({
  MODEL: 'gemini-2.5-flash-image',
  ASPECT_RATIO: '1:1',
})

/**
 * Options for generating recipe image
 */
export interface GenerateRecipeImageOptions {
  recipe: CreateRecipeRequest
  userId: string
  recipeId: string
}

/**
 * Service for AI-powered recipe image generation
 */
export class RecipeImageService {
  private ai: GoogleGenAI

  constructor() {
    this.ai = new GoogleGenAI({})
  }

  /**
   * Generate image prompt based on recipe details
   * @param recipe Recipe data
   * @returns Image prompt
   */
  private generateImagePrompt(recipe: CreateRecipeRequest): string {
    const title = recipe.title.toLowerCase()

    // Determine serving vessel based on recipe type
    const isBeverage = /(juice|latte|coffee|tea|mocktail|cocktail|soda|cold brew|milkshake)/i.test(
      title
    )

    const isSmoothieBowl =
      /(smoothie bowl|acai bowl|chia bowl|mousse|pudding|dessert bowl|dessert)/i.test(title)
    const isSmoothieDrink = /(smoothie|shake)/i.test(title) && !isSmoothieBowl
    const isSoup = /(soup|broth|stew|ramen)/i.test(title)

    const servingVessel = isBeverage
      ? 'transparent glass or mason jar'
      : isSmoothieDrink
        ? 'tall smoothie glass or mason jar'
        : isSmoothieBowl || isSoup
          ? 'ceramic bowl'
          : 'circular ceramic plate'

    const ingredientsList = recipe.ingredients.map(ingredient => ingredient.name).join(', ')

    return `
    A high-resolution, top-down food photograph of ${recipe.title}, centered perfectly on a ${servingVessel} of consistent size (all recipes use identical size and scale).

    The dish should be presented neatly on the plate with ${ingredientsList} clearly visible as part of the meal. 
    
    Composition & style guidelines:
    - Uniform 1:1 square aspect ratio (1024x1024)
    - The dish must be on a **perfectly circular ${servingVessel}**, captured from a pure 90° top-down angle only — no tilt or perspective.
    - The ${servingVessel} must be a perfect circle with no perspective distortion.
    - The ${servingVessel} should be centered and occupy roughly 80-85% of the frame with even padding around it.
    - Same ${servingVessel} size and camera distance for all images
    - Pure white or transparent background (no table, shadows, or props)
    - Soft natural lighting, realistic textures, vivid but natural colors, and appetizing presentation
    - Professional studio-style food photography with consistent framing
    - Isolated product photo composition suitable for a visual catalog
    `
  }

  /**
   * Generate recipe image from recipe data
   * @param options Generation options
   * @returns Image buffer
   */
  async generateRecipeImage(options: GenerateRecipeImageOptions): Promise<Buffer> {
    const { recipe, userId, recipeId } = options

    const prompt = this.generateImagePrompt(recipe)

    const imageResponse = await this.ai.models.generateContent({
      model: IMAGE_CONFIG.MODEL,
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: IMAGE_CONFIG.ASPECT_RATIO,
        },
      },
    })

    if (!imageResponse.candidates) {
      throw new Error('No image response from AI')
    }

    await trackAiUsage(
      {
        input_tokens: imageResponse.usageMetadata?.promptTokenCount ?? 0,
        output_tokens: imageResponse.usageMetadata?.candidatesTokenCount ?? 0,
      },
      {
        provider: AiProvider.Google,
        model: IMAGE_CONFIG.MODEL,
        feature: 'recipe:generate-image',
        initiator: 'worker:generate-recipe',
        user_id: userId,
        recipe_id: recipeId,
      }
    )

    // Extract image buffer from response
    for (const part of imageResponse.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        const imageData = part.inlineData.data
        return Buffer.from(imageData ?? '', 'base64')
      }
    }

    throw new Error('No image data found in AI response')
  }
}

/**
 * Singleton instance
 */
export const recipeImageService = new RecipeImageService()
