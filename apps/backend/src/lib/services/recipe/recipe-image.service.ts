import { GoogleGenAI } from '@google/genai'
import type { CreateRecipeRequest } from '@culyn/shared/schemas'
import { trackAiUsage } from '@/lib/ai/usage'
import { AiProvider } from '@/lib/ai/types'

const IMAGE_CONFIG = Object.freeze({
  MODEL: 'gemini-2.5-flash-image',
  ASPECT_RATIO: '1:1' as const,
})

export interface GenerateRecipeImageOptions {
  recipe: CreateRecipeRequest
  userId: string
  recipeId: string
}

export class RecipeImageService {
  private ai: GoogleGenAI

  constructor() {
    this.ai = new GoogleGenAI({})
  }

  private generateImagePrompt(recipe: CreateRecipeRequest): string {
    const title = recipe.title.toLowerCase()

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
    Create a high-resolution, top-down food photograph of "${recipe.title}" on a single, luxurious ${servingVessel}.

    Composition & presentation:
    - There is exactly ONE ${servingVessel}, placed **perfectly in the center** of the square frame.
    - The ${servingVessel} is fully visible and not cropped; the rim is complete and symmetrical on all sides.
    - The ${servingVessel} should occupy roughly 80% of the image width and height
    - The dish is arranged neatly with ${ingredientsList} clearly visible as part of the meal.

    Composition & style guidelines:
    - Pure 90 degree top-down angle only -- no tilt or perspective.
    - No perspective distortion; the ${servingVessel} appears as a perfect circle/oval, not an ellipse caused by camera angle.
    - Same ${servingVessel} size, framing, and camera distance for all images to keep scale consistent.
    - The background should be pure white.
    - Soft natural lighting, realistic textures, vivid but natural colors, and appetizing presentation.
    - Professional studio-style food photography with clean, catalog-like composition.
    `
  }

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
        initiator: 'worker:content-import',
        user_id: userId,
        recipe_id: recipeId,
      }
    )

    for (const part of imageResponse.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        const imageData = part.inlineData.data
        return Buffer.from(imageData ?? '', 'base64')
      }
    }

    throw new Error('No image data found in AI response')
  }
}

export const recipeImageService = new RecipeImageService()
