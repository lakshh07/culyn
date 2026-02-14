import { AiProvider } from '@/lib/ai/types'
import { withAiUsageTracking } from '@/lib/ai/usage'
import { CreatePlaceRequestSchema, type CreatePlaceRequest } from '@culyn/shared/schemas'
import { Output, generateText } from 'ai'
import fs from 'fs'
import os from 'os'
import path from 'path'

const AI_CONFIG = Object.freeze({
  MODEL: 'gemini-2.5-flash',
  TEMPERATURE: 0.3,
})

const PLACE_PROMPTS = Object.freeze({
  SYSTEM: `
    You are an expert place extraction AI. Your task is to analyze a social media video or post
    along with its caption/description and extract complete, structured place information.

    ### Extraction Guidelines

    1. **Video & Content Analysis Priority**
      - Analyze the ENTIRE video/post carefully
      - Note visible signage, menus, logos, storefront text, geotags, and spoken mentions
      - Pay attention to on-screen text, hashtags, tagged accounts, and visual cues
      - If video and caption conflict, prefer the video content

    2. **Place Identification**
      - Extract the exact place name as shown
      - Identify the place type:
        RESTAURANT, CAFE, BAR, BAKERY, FOOD_TRUCK, MARKET, GROCERY_STORE, SPECIALTY_SHOP, OTHER
      - Choose ONLY one primary type based on its main function
      - If multiple places are shown, extract the primary featured location
      - Clean emojis, excessive punctuation, and formatting artifacts

    3. **Address Extraction**
      - Extract structured address fields:
        street, city, state, country, postal_code
      - Only use information explicitly mentioned or clearly visible
      - If a component is not available, return null
      - Do NOT fabricate or fully infer missing address components

    4. **Cuisine & Classification**
      - Identify cuisine type ONLY if clearly food-related
      - Do not assume cuisine based solely on decor or creator ethnicity
      - If not determinable, return null

    5. **Price Range**
      - Extract price range ONLY if explicitly mentioned
      - Use standardized scale: $, $$, $$$, $$$$
      - Do NOT estimate or infer pricing
      - If not mentioned, return null

    6. **Tags & Classification**
      - Assign 2-4 relevant tags from:
        CUISINE, MEAL_TYPE, DIET, SEASON, OCCASION, CUSTOM
      - Only choose the most fitting tags
      - Do NOT include all categories

    7. **Short & Catchy Title**
      - 3-7 words
      - Modern discovery app style
      - No long hyphens or marketing-heavy phrases

    8. **Text Cleanup Requirements**
      - Remove emojis and special characters
      - Standardize capitalization
      - Avoid promotional fluff
      - Ensure structured fields contain clean, normalized values

    ---

    ### Output Rules

    - Return ONLY valid JSON
    - NO markdown
    - NO explanations
    - NO extra text outside the JSON
    - Fill all fields -- use null where information is not available
    - Do NOT fabricate missing details

    Your output must always follow the provided Zod schema exactly.`,
  USER: (caption: string) => `
    You are provided with a full place video and its caption/description.    

    Your task:
    Analyze the complete video -- including the audio, visual actions, place shown,
    on-screen text, and any other cues -- along with the caption/description text.

    From this combined information, extract and return the final structured place JSON.

    Video File Input: [video file attached]
    Caption/Description Text: ${caption}

    Follow the system instructions strictly.
    Return ONLY valid JSON matching the exact schema -- no explanations or extra text.
  `,
})

export interface GeneratePlaceOptions {
  videoBuffer: Buffer
  caption: string
  placeId: string
  userId: string
}
export class PlaceAIService {
  async generate(options: GeneratePlaceOptions): Promise<CreatePlaceRequest> {
    const { videoBuffer, caption, placeId, userId } = options

    const tempVideoPath = path.join(os.tmpdir(), `video-${placeId}-${Date.now()}.mp4`)

    try {
      fs.writeFileSync(tempVideoPath, videoBuffer)

      const { output: placeData } = await withAiUsageTracking(
        generateText({
          model: 'google/gemini-2.5-flash',
          output: Output.object({ schema: CreatePlaceRequestSchema }),
          messages: [
            { role: 'system', content: PLACE_PROMPTS.SYSTEM },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: PLACE_PROMPTS.USER(caption),
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
          feature: 'place:generate',
          initiator: 'worker:content-import',
          user_id: userId,
          place_id: placeId,
        }
      )

      if (!placeData) {
        throw new Error('Failed to generate place data from AI')
      }

      return placeData
    } finally {
      if (fs.existsSync(tempVideoPath)) {
        fs.unlinkSync(tempVideoPath)
      }
    }
  }
}

export const placeAIService = new PlaceAIService()
