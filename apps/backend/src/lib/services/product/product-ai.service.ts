import { AiProvider } from '@/lib/ai/types'
import { withAiUsageTracking } from '@/lib/ai/usage'
import { CreateProductRequestSchema, type CreateProductRequest } from '@culyn/shared/schemas'
import { Output, generateText } from 'ai'
import fs from 'fs'
import os from 'os'
import path from 'path'

const AI_CONFIG = Object.freeze({
  MODEL: 'gpt-4o-mini',
  TEMPERATURE: 0.3,
})

const PRODUCT_PROMPTS = Object.freeze({
  SYSTEM: `
  You are an expert product extraction AI. Your task is to analyze a social media video or post
  along with its caption/description and extract complete, structured product information.
  
  ### Extraction Guidelines
  
  1. **Video & Content Analysis Priority**
    - Analyze the ENTIRE video/post carefully
    - Note all visible branding, packaging text, logos, and product demonstrations
    - Pay attention to on-screen text, spoken mentions, hashtags, and visual cues
    - If video and caption conflict, prefer the video content
  
  2. **Product Identification**
    - Identify the exact product name, brand, and model/version if available
    - Use context clues from hashtags, tagged brands, packaging, and descriptions
    - If multiple products appear, extract the primary featured product
    - Clean up emojis, excessive punctuation, and formatting artifacts
  
  3. **Category Classification**
    - Determine the most appropriate category:
      BEAUTY, TECH, FASHION, KITCHEN, HOME, HEALTH, SPORTS, BOOKS, TOYS, OTHER
    - Choose ONLY one primary category based on product function
  
  4. **Pricing & Availability**
    - Extract price and currency ONLY if explicitly mentioned
    - Standardize currency codes (USD, INR, EUR, etc.)
    - If price or currency is not mentioned, return null for those fields
    - Do NOT estimate, infer, or assume pricing under any circumstances
  
  5. **Specifications & Features**
    - Extract technical specifications as structured key-value pairs
    - Include dimensions, materials, color variants, capacity, compatibility, etc.
    - List notable features as concise bullet-style strings
    - Avoid marketing fluff; focus on objective attributes
  
  6. **Short & Catchy Title**
    - 3-7 words
    - Modern product app style
    - No long hyphens or overly promotional phrases
  
  7. **Tags & Classification**
    - Assign 2-4 relevant tags from:
      BEAUTY, TECH, FASHION, KITCHEN, HOME, HEALTH, SPORTS, BOOKS, TOYS, OTHER
    - Only pick the most fitting tags
    - Do NOT include all categories
  
  8. **Text Cleanup Requirements**
    - Remove emojis and special characters
    - Standardize capitalization
    - Convert measurements to consistent units (cm, mm, g, ml, oz, inches)
    - Ensure numeric values are plain numbers without units in structured numeric fields
  
  ---
  
  ### Output Rules
  
  - Return **only valid JSON**
  - NO markdown
  - NO explanations
  - NO extra text outside the JSON
  - Fill *all* fields -- estimate when needed
  
  Your output must always follow the provided Zod schema exactly.
  `,
  USER: (caption: string) => `
    You are provided with a full product video and its caption/description.    

    Your task:
    Analyze the complete video -- including the audio, visual actions, product shown,
    on-screen text, and any other cues -- along with the caption/description text.

    From this combined information, extract and return the final structured product JSON.

    Video File Input: [video file attached]
    Caption/Description Text: ${caption}

    Follow the system instructions strictly.
    Return ONLY valid JSON matching the exact schema -- no explanations or extra text.
  `,
})

export interface ExtractProductFromCaptionOptions {
  caption: string
  ownerUsername: string
  url: string
  productId: string
  userId: string
}

export interface GenerateProductOptions {
  videoBuffer: Buffer
  caption: string
  productId: string
  userId: string
}

export class ProductAIService {
  async generate(options: GenerateProductOptions): Promise<CreateProductRequest> {
    const { videoBuffer, caption, productId, userId } = options

    const tempVideoPath = path.join(os.tmpdir(), `video-${productId}-${Date.now()}.mp4`)

    try {
      fs.writeFileSync(tempVideoPath, videoBuffer)

      const { output: productData } = await withAiUsageTracking(
        generateText({
          model: 'google/gemini-2.5-flash',
          output: Output.object({ schema: CreateProductRequestSchema }),
          messages: [
            { role: 'system', content: PRODUCT_PROMPTS.SYSTEM },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: PRODUCT_PROMPTS.USER(caption),
                },
                {
                  type: 'file',
                  mediaType: 'video/mp4',
                  data: fs.readFileSync(tempVideoPath),
                },
              ],
            },
          ],
          temperature: AI_CONFIG.TEMPERATURE,
        }),
        async data => ({
          input_tokens: data.usage.inputTokens ?? 0,
          output_tokens: data.usage.outputTokens ?? 0,
        }),
        {
          provider: AiProvider.Google,
          model: AI_CONFIG.MODEL,
          feature: 'product:generate',
          initiator: 'worker:content-import',
          user_id: userId,
          product_id: productId,
        }
      )

      if (!productData) {
        throw new Error('Failed to generate product data from AI')
      }

      return productData
    } finally {
      if (fs.existsSync(tempVideoPath)) {
        fs.unlinkSync(tempVideoPath)
      }
    }
  }
}

export const productAIService = new ProductAIService()
