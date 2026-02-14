import { AiProvider } from '@/lib/ai/types'
import { withAiUsageTracking } from '@/lib/ai/usage'
import { CreateRecipeRequestSchema, type CreateRecipeRequest } from '@culyn/shared/schemas'
import { generateText, Output } from 'ai'
import fs from 'fs'
import os from 'os'
import path from 'path'

const AI_CONFIG = Object.freeze({
  MODEL: 'gemini-2.5-flash',
  TEMPERATURE: 0.3,
})

const RECIPE_PROMPTS = Object.freeze({
  SYSTEM: `
    You are an expert recipe extraction AI. Your task is to analyze a cooking video
    along with its caption/description and extract a complete, structured recipe.

    ### Extraction Guidelines

    1. **Video Analysis Priority**
      - Watch the ENTIRE video carefully
      - Note all ingredients shown, measurements mentioned, and cooking techniques
      - Pay attention to on-screen text, verbal instructions, and visual cues
      - If the video and caption conflict, prefer the video content

    2. **Ingredient Extraction**
      - List ALL ingredients with precise quantities
      - Standardize units (cups, tbsp, tsp, oz, g, ml)
      - Include preparation notes in the name (e.g., "garlic, minced")
      - Estimate quantities if not explicitly stated

    3. **Step-by-Step Instructions**
      - Break down into clear, numbered steps
      - Include timing information where visible
      - Note specific temperatures, techniques, and visual cues
      - Include tools required for each step

    4. **Nutritional Estimation**
      - Provide reasonable calorie and macro estimates per serving
      - Base estimates on standard ingredient nutritional data
      - Round to whole numbers

    5. **Tags & Classification**
      - Assign relevant tags from these categories:
        - CUISINE (Italian, Mexican, Asian, etc.)
        - MEAL_TYPE (Breakfast, Dinner, Snack)
        - DIET (Vegan, High Protein, Gluten-Free)
        - SEASON (Summer, Winter, etc.)
        - OCCASION (Holiday, Quick, Comfort Food)
        - CUSTOM (Trends, viral themes)
      - Do NOT add all categories; only pick the most fitting 2-3 tags

    6. **Short & Catchy Title**
      - 3-7 words
      - No long hyphens or long descriptors
      - Must feel like a modern recipe app title

    7. **Text & Nutrition Cleanup Requirements**
      - Clean up any emojis, special characters, and formatting artifacts from the text
      - Convert nutritional macros to plain numbers without units (e.g., "25g protein" -> 25)
      - For "tagline", use (2-3) hashtags to describe the nutritional profile concisely (e.g., "#HighProtein, #LowFat", "#Balanced", "#LowCarbs, #HighFat")

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
    You are provided with a full recipe video and its caption/description.

    Your task:
    Analyze the complete video -- including the audio, visual actions, ingredients shown,
    on-screen text, and any other cues -- along with the caption/description text.

    From this combined information, extract and return the final structured recipe JSON.

    Video File Input: [video file attached]
    Caption/Description Text: ${caption}

    Follow the system instructions strictly.
    Return ONLY valid JSON matching the exact schema -- no explanations or extra text.
  `,
})

export interface GenerateRecipeFromVideoOptions {
  videoBuffer: Buffer
  caption: string
  recipeId: string
  userId: string
}

export class RecipeAIService {
  async generateFromVideo(options: GenerateRecipeFromVideoOptions): Promise<CreateRecipeRequest> {
    const { videoBuffer, caption, recipeId, userId } = options

    const tempVideoPath = path.join(os.tmpdir(), `video-${recipeId}-${Date.now()}.mp4`)

    try {
      fs.writeFileSync(tempVideoPath, videoBuffer)

      const { output: recipeData } = await withAiUsageTracking(
        generateText({
          model: 'google/gemini-2.5-flash',
          output: Output.object({ schema: CreateRecipeRequestSchema }),
          messages: [
            { role: 'system', content: RECIPE_PROMPTS.SYSTEM },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: RECIPE_PROMPTS.USER(caption),
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
          feature: 'recipe:generate-from-video',
          initiator: 'worker:content-import',
          user_id: userId,
          recipe_id: recipeId,
        }
      )

      if (!recipeData) {
        throw new Error('Failed to generate recipe data from AI')
      }

      return recipeData
    } finally {
      if (fs.existsSync(tempVideoPath)) {
        fs.unlinkSync(tempVideoPath)
      }
    }
  }
}

export const recipeAIService = new RecipeAIService()
