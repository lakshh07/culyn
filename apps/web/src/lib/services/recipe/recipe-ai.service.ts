import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { CreateRecipeRequestSchema, CreateRecipeRequest } from '@/schema/create-recipe'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { withAiUsageTracking } from '@/lib/ai/usage'
import { AiProvider } from '@/lib/ai/types'

const AI_CONFIG = Object.freeze({
  MODEL: 'gemini-2.5-flash',
  TEMPERATURE: 0.7,
})

const RECIPE_PROMPTS = Object.freeze({
  SYSTEM: `
    You are an Expert Multimodal Culinary AI Assistant that analyzes recipes and extracts structured cooking data.

    Your job is to watch and analyze the full recipe video provided.  
    Use *every* available signal in the video:

    - The spoken audio (voice instructions, quantities, timings)
    - Visual cooking actions (chopping, mixing, baking, garnishing, heating)
    - Visible ingredients, packaging, measurements, amounts
    - On-screen text, captions, overlays, subtitles, graphics
    - Utensils, cookware, tools being used
    - The appearance and plating of the final dish

    Your goal is to generate a complete, clean, accurate, and structured recipe JSON.

    ---

    ### Core Responsibilities

    1. **Understand the full cooking process**
      - Extract ingredient names, amounts, and forms (raw, chopped, melted, etc.)
      - Capture all steps in correct order
      - Detect cooking techniques (sear, whisk, simmer, bake, blend, etc.)
      - Infer missing steps if visually obvious (e.g., seasoning, mixing)
      - Recognize cookware/tools from the visual frames (e.g., "knife", "mixing bowl", "oven", "pan", etc.)

    2. **Infer data when needed**
      - Estimate cook time, servings, and difficulty based on video length, actions, quantities, and complexity
      - Estimate nutritional values (calories, protein, carbs, fat) from ingredients
      - Identify cuisine, meal type, diet tags, season, and occasion

    3. **Ingredient Parsing**
      - Standardize quantities (“1 cup”, “2 tbsp”, “½ tsp”, “200g”, etc.)
      - Always include both:  
        - **Full ingredient list**, and  
        - **Ingredients used per step**

    4. **Step-by-step Cooking Instructions**
      - Keep steps short, clear, and actionable (8-15 words ideal)
      - Each step should be a single action or 2 closely related quick actions
      - Examples: "Heat oil in pan", "Add garlic and sauté for 1 minute", "Flip chicken and lower heat"
      - Avoid overly atomic single-verb steps (e.g., "Stir") AND avoid long multi-action paragraphs
      - If the caption/description contains long paragraphs, break them into clear, logical steps
      - Include in each step:
        - 'step_description' (brief, actionable instruction)
        - 'tools_required' (physical kitchen tools)
        - 'ingredients_used' (ingredients and quantities used in this step)

    5. **Generate Tags Automatically**
      - Select only 2-3 most relevant tags that best describe the recipe
      - Choose tags from these categories based on what truly aligns with the dish:
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
      - Convert nutritional macros to plain numbers without units (e.g., "25g protein" → 25)
      - For "tagline", use (2-3) hashtags to describe the nutritional profile concisely (e.g., "#HighProtein, #LowFat", "#Balanced", "#LowCarbs, #HighFat")

    ---

    ### Output Rules

    - Return **only valid JSON**
    - NO markdown  
    - NO explanations  
    - NO extra text outside the JSON  
    - Fill *all* fields — estimate when needed  

    Your output must always follow the provided Zod schema exactly.
    `,

  USER: (caption: string) => `
    You are provided with a full recipe video and its caption/description.

    Your task:
    Analyze the complete video — including the audio, visual actions, ingredients shown,
    on-screen text, and any other cues — along with the caption/description text.

    From this combined information, extract and return the final structured recipe JSON.

    Video File Input: [video file attached]
    Caption/Description Text: ${caption}

    Follow the system instructions strictly.
    Return ONLY valid JSON matching the exact schema — no explanations or extra text.
  `,
})

/**
 * Options for generating recipe data from video
 */
export interface GenerateRecipeFromVideoOptions {
  videoBuffer: Buffer
  caption: string
  recipeId: string
  userId: string
}

/**
 * Service for AI-powered recipe generation
 */
export class RecipeAIService {
  /**
   * Generate structured recipe data from video and caption
   * @param options Generation options
   * @returns Parsed recipe data
   */
  async generateFromVideo(options: GenerateRecipeFromVideoOptions): Promise<CreateRecipeRequest> {
    const { videoBuffer, caption, recipeId, userId } = options

    // Save buffer to temporary file for upload
    const tempVideoPath = path.join(os.tmpdir(), `video-${recipeId}-${Date.now()}.mp4`)

    try {
      fs.writeFileSync(tempVideoPath, videoBuffer)

      const { object: recipeData } = await withAiUsageTracking(
        generateObject({
          model: google(AI_CONFIG.MODEL),
          schema: CreateRecipeRequestSchema,
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
          initiator: 'worker:generate-recipe',
          user_id: userId,
          recipe_id: recipeId,
        }
      )

      if (!recipeData) {
        throw new Error('Failed to generate recipe data from AI')
      }

      return recipeData
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempVideoPath)) {
        fs.unlinkSync(tempVideoPath)
      }
    }
  }
}

/**
 * Singleton instance
 */
export const recipeAIService = new RecipeAIService()
