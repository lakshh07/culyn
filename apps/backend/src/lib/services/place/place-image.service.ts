import { AiProvider } from '@/lib/ai/types'
import { trackAiUsage } from '@/lib/ai/usage'
import { GoogleGenAI } from '@google/genai'

const IMAGE_CONFIG = Object.freeze({
  MODEL: 'gemini-2.5-flash-image',
  ASPECT_RATIO: '1:1' as const,
})

export interface GeneratePlaceImageOptions {
  place: {
    name: string
    type?: string
    cuisine?: string | null
    city?: string | null
  }
  userId: string
  placeId: string
}

export class PlaceImageService {
  private ai: GoogleGenAI

  constructor() {
    this.ai = new GoogleGenAI({})
  }

  private generateImagePrompt(place: GeneratePlaceImageOptions['place']): string {
    const typeLabel = place.type ? place.type.replace(/_/g, ' ').toLowerCase() : 'establishment'
    const cuisineText = place.cuisine ? ` specializing in ${place.cuisine} cuisine` : ''
    const cityText = place.city ? ` in ${place.city}` : ''

    return `
    Create a high-resolution, professional architectural/exterior photograph of a ${typeLabel}${cuisineText} called "${place.name}"${cityText}.

    Scene & composition:
    - Attractive, well-lit exterior facade or storefront
    - Warm inviting ambiance with clean signage
    - The establishment occupies the majority of the frame
    - Natural or golden-hour lighting

    Style guidelines:
    - Professional editorial photography style
    - Vibrant, realistic colors with warm tones
    - Sharp focus on the building/storefront
    - Clean, appealing presentation suitable for a directory listing
    - No people in the foreground blocking the facade
    - No text overlays or watermarks

    The image should evoke the atmosphere and character of the ${typeLabel} and look like a professional travel/food editorial photo.
    `
  }

  async generatePlaceImage(options: GeneratePlaceImageOptions): Promise<Buffer> {
    const { place, userId, placeId } = options

    const prompt = this.generateImagePrompt(place)

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
        feature: 'place:generate-image',
        initiator: 'admin:image-regen',
        user_id: userId,
        place_id: placeId,
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

export const placeImageService = new PlaceImageService()
