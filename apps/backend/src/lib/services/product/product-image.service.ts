import { AiProvider } from '@/lib/ai/types'
import { trackAiUsage } from '@/lib/ai/usage'
import type { CreateProductRequest } from '@culyn/shared/schemas'
import { GoogleGenAI } from '@google/genai'

const IMAGE_CONFIG = Object.freeze({
  MODEL: 'gemini-2.5-flash-image',
  ASPECT_RATIO: '1:1' as const,
})

const SURFACE_BY_CATEGORY: Record<string, string> = {
  BEAUTY: 'clean marble surface with soft pink ambient light',
  TECH: 'modern minimalist desk with matte dark surface',
  FASHION: 'light linen fabric background with natural folds',
  KITCHEN: 'warm wood countertop with subtle grain texture',
  HOME: 'neutral concrete surface with soft natural light',
  HEALTH: 'clean white surface with green botanical accents',
  SPORTS: 'textured athletic mat surface',
  BOOKS: 'warm wooden reading desk with soft lamp light',
  TOYS: 'bright pastel-colored surface with playful setting',
  OTHER: 'clean white studio background',
}

export interface GenerateProductImageOptions {
  product: CreateProductRequest
  userId: string
  productId: string
}

export class ProductImageService {
  private ai: GoogleGenAI

  constructor() {
    this.ai = new GoogleGenAI({})
  }

  private generateImagePrompt(product: CreateProductRequest): string {
    const category = product.category || 'OTHER'
    const surface = SURFACE_BY_CATEGORY[category] || SURFACE_BY_CATEGORY.OTHER

    const brandText = product.brand ? ` by ${product.brand}` : ''
    const featuresText =
      product.features && product.features.length > 0
        ? `\nKey features visible: ${product.features.slice(0, 3).join(', ')}`
        : ''

    return `
    Create a high-resolution product photograph of "${product.name}"${brandText}.

    Scene & surface:
    - Product placed on a ${surface}
    - The product is centered in the frame and occupies roughly 70% of the image

    Composition & style guidelines:
    - Clean, professional product photography style
    - Soft studio lighting with subtle shadows for depth
    - 45-degree angle slightly elevated perspective
    - Sharp focus on the product with soft background bokeh
    - Realistic textures, accurate colors, and premium presentation
    - No text overlays, watermarks, or labels${featuresText}

    The image should look like a professional e-commerce or editorial product photo.
    `
  }

  async generateProductImage(options: GenerateProductImageOptions): Promise<Buffer> {
    const { product, userId, productId } = options

    const prompt = this.generateImagePrompt(product)

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
        feature: 'product:generate-image',
        initiator: 'worker:content-import',
        user_id: userId,
        product_id: productId,
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

export const productImageService = new ProductImageService()
