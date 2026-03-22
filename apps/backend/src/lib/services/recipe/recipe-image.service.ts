import { AiProvider } from '@/lib/ai/types'
import { trackAiUsage } from '@/lib/ai/usage'
import type { CreateRecipeRequest } from '@culyn/shared/schemas'
import { GoogleGenAI } from '@google/genai'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

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
  private referenceImages: Record<'plate' | 'bowl' | 'jar', string>

  constructor() {
    this.ai = new GoogleGenAI({})
    const load = (name: string) =>
      readFileSync(join(import.meta.dir, 'assets', name)).toString('base64')
    this.referenceImages = {
      plate: load('plate-reference.png'),
      bowl: load('bowl-reference.png'),
      jar: load('jar-reference.png'),
    }
  }

  private buildImageRequest(recipe: CreateRecipeRequest): {
    prompt: string
    referenceKey: 'plate' | 'bowl' | 'jar'
  } {
    const title = recipe.title.toLowerCase()

    const isBeverage = /(juice|latte|coffee|tea|mocktail|cocktail|soda|cold brew|milkshake)/i.test(
      title
    )
    const isSmoothieBowl =
      /(smoothie bowl|acai bowl|chia bowl|mousse|pudding|dessert bowl|dessert)/i.test(title)
    const isSmoothieDrink = /(smoothie|shake)/i.test(title) && !isSmoothieBowl
    const isSoup = /(soup|broth|stew|ramen)/i.test(title)

    const referenceKey: 'plate' | 'bowl' | 'jar' =
      isBeverage || isSmoothieDrink ? 'jar' : isSmoothieBowl || isSoup ? 'bowl' : 'plate'

    const servingVessel =
      referenceKey === 'jar'
        ? 'transparent glass or mason jar'
        : referenceKey === 'bowl'
          ? 'ceramic bowl'
          : 'circular ceramic plate'

    const ingredientsList = recipe.ingredients.map(ingredient => ingredient.name).join(', ')
    const contentDescription =
      referenceKey === 'jar'
        ? `a drink that reflects the flavors of ${ingredientsList}`
        : `${ingredientsList} arranged neatly as part of the meal`

    const prompt = `
    Create a high-resolution, top-down food photograph of "${recipe.title}" in a single, luxurious ${servingVessel}.

    Composition & presentation:
    - There is exactly ONE ${servingVessel}, placed **perfectly in the center** of the square frame.
    - The ${servingVessel} is fully visible and not cropped; the opening is complete and symmetrical on all sides.
    - The ${servingVessel} should occupy roughly 80% of the image width and height.
    - The ${servingVessel} contains ${contentDescription}.

    Composition & style guidelines:
    - Pure 90 degree top-down angle only -- no tilt or perspective.
    - No perspective distortion; the ${servingVessel} appears as a perfect circle, not an ellipse caused by camera angle.
    - Same ${servingVessel} size, framing, and camera distance for all images to keep scale consistent.
    - The background should be pure white.
    - Soft natural lighting, realistic textures, vivid but natural colors, and appetizing presentation.
    - Professional studio-style food photography with clean, catalog-like composition.

    STRICT REFERENCE CONSTRAINTS (must be followed exactly):
    - The provided reference image is a STRICT TEMPLATE, not inspiration.
    - Use the EXACT same vessel shape, background, lighting, framing, and proportions.
    - DO NOT modify the vessel size or shape.
    - The vessel color/finish may be adapted to complement the food (e.g. a warm terracotta tone for a tomato dish, a cool grey for a salad) but the shape and form must remain identical.
    - DO NOT change the background (must remain identical pure white).
    - DO NOT introduce shadows, gradients, or lighting variations.
    - Only add the food on/in the vessel.
    `
    return { prompt, referenceKey }
  }

  async generateRecipeImage(options: GenerateRecipeImageOptions): Promise<Buffer> {
    const { recipe, userId, recipeId } = options

    const { prompt, referenceKey } = this.buildImageRequest(recipe)

    const imageResponse = await this.ai.models.generateContent({
      model: IMAGE_CONFIG.MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: this.referenceImages[referenceKey],
                mimeType: 'image/png',
              },
            },
            { text: prompt },
          ],
        },
      ],
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
        const buffer = Buffer.from(part.inlineData.data ?? '', 'base64')
        return sharp(buffer).flatten({ background: '#FFFFFF' }).toBuffer()
      }
    }

    throw new Error('No image data found in AI response')
  }
}

export const recipeImageService = new RecipeImageService()
