import { Job, JobProgress, Worker } from 'bullmq'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { connectionOptions, QUEUE_NAMES, workerOptions } from '@/bull/config'
import { RecipeGenerationJobData, RecipeGenerationJobResult } from '@/bull/types'
import db from '@/lib/prisma'
import { getInstagramPostData } from '@/lib/instagram-scraper'
import { RecipeSourceData } from '@/types/recipe-source-data'
import { GoogleGenAI } from '@google/genai'
import { s3 } from '@/lib/aws/s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { JobStatus, RecipeDifficulty, RecipeSourceType, TagType } from '@/generated/prisma/enums'

new Worker<RecipeGenerationJobData, RecipeGenerationJobResult>(
  QUEUE_NAMES.RECIPE_GENERATION,
  async job => {
    await job.updateProgress(0)

    const imageAi = new GoogleGenAI({})

    const [user, organization] = await Promise.all([
      db.user.findUnique({
        where: {
          id: job.data.userId,
        },
      }),
      db.organization.findUnique({
        where: {
          id: job.data.organizationId,
        },
      }),
    ])

    if (!user || !organization) {
      throw new Error('User or organization not found')
    }

    await job.updateProgress(10)

    const recipe = await db.recipe.findFirst({
      where: { id: job.data.recipeId, orgId: organization.id, userId: user.id },
    })

    if (!recipe) {
      throw new Error('Recipe not found')
    }

    await job.updateProgress(20)

    let sourceData: RecipeSourceData | null = null

    switch (job.data.sourceType) {
      case RecipeSourceType.INSTAGRAM_REEL:
        sourceData = await getInstagramPostData(job.data.url)
        break
    }

    if (!sourceData || !sourceData.caption) {
      throw new Error('Source data not found')
    }

    await job.updateProgress(45)

    const PROMPTS = {
      SYSTEM_PROMPT: `
        You are an AI chef assistant that analyzes recipes and extracts structured cooking data.

        Your role:
        You carefully read recipe captions, text, or video descriptions and transform them into clean, well-structured JSON data that home cooks and food enthusiasts can use.

        Return only valid JSON (no markdown, no explanations outside the JSON structure).

        Guidelines for extracting recipe data:
        - Clean up any emojis, special characters, and formatting artifacts from the text
        - Standardize ingredient quantities and units (e.g., "tbsp", "cup", "oz", "g")
        - Convert nutritional macros to numbers without units
        - ALL fields are required - make your best estimate if information is missing
        - Infer cook time and servings from the recipe complexity and ingredient amounts
        - Estimate nutritional values (calories, carbs, protein, fat) based on ingredients if not explicitly stated
        - For "tagline", describe the nutritional profile concisely (e.g., "High protein, low fat", "Balanced meal", "Low carbs, high fat")
        - List only physical kitchen tools needed (e.g., "knife", "mixing bowl", "oven", "pan")
        - Add relevant tags that help categorize the recipe (cuisine type, meal type, dietary preferences, season, occasion)
        `,
      USER_PROMPT: `Extract and return the recipe JSON for this recipe from the caption and video:
      
        Video URL: ${job.data.url}
        Caption: ${sourceData.caption}

        Infer details from the video caption. Follow the output JSON format strictly.`,
    }

    await job.updateProgress(52)

    const { object: recipeData } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: z
        .object({
          title: z.string().describe('The title of the recipe'),
          description: z.string().describe('A brief, appetizing description of the recipe'),
          calories: z.number().describe('Total calories per serving'),
          carbs_g: z.number().describe('Total carbohydrates in grams per serving'),
          protein_g: z.number().describe('Total protein in grams per serving'),
          fat_g: z.number().describe('Total fat in grams per serving'),
          tagline: z
            .string()
            .describe(
              'A brief nutritional summary like "High protein, low fat", "Balanced meal", or "Low carbs, high fat"'
            ),
          cook_time_minutes: z.number().describe('Total cooking time in minutes'),
          servings: z.number().describe('Number of servings the recipe makes'),
          difficulty: z
            .enum(['EASY', 'MEDIUM', 'HARD'])
            .describe('The difficulty level of preparing this recipe'),
          ingredients: z
            .array(
              z.object({
                name: z.string().describe('The name of the ingredient (standardized and clean)'),
                quantity: z
                  .string()
                  .describe('The quantity with unit (e.g., "2 tbsp", "1 cup", "1/2 tsp")'),
              })
            )
            .describe('List of all ingredients needed for the recipe'),
          cooking_steps: z
            .array(
              z.object({
                step_number: z.number().describe('The sequential step number (1, 2, 3, etc.)'),
                step_description: z
                  .string()
                  .describe('Clear, concise instruction for this cooking step'),
                tools_required: z
                  .array(z.string())
                  .describe(
                    'Physical kitchen tools needed for this step (e.g., "knife", "mixing bowl", "oven", "pan")'
                  ),
                ingredients_used: z
                  .array(
                    z.object({
                      name: z.string().describe('Name of the ingredient used in this step'),
                      quantity: z
                        .string()
                        .describe(
                          'Quantity of this ingredient used in this step (e.g., "1 cup", "2 tbsp")'
                        ),
                    })
                  )
                  .describe('Ingredients used specifically in this cooking step'),
              })
            )
            .describe('Step-by-step cooking instructions'),
          tags: z
            .array(
              z.object({
                type: z
                  .enum(['CUISINE', 'MEAL_TYPE', 'DIET', 'SEASON', 'OCCASION', 'CUSTOM'])
                  .describe('The category type of this tag'),
                value: z
                  .string()
                  .describe(
                    'The tag value (e.g., "Italian", "Dinner", "Vegetarian", "Summer", "Holiday", "Quick & Easy")'
                  ),
              })
            )
            .describe('Tags that categorize and describe the recipe'),
        })
        .describe('Complete structured recipe data extracted from the input'),
      messages: [
        { role: 'system', content: PROMPTS.SYSTEM_PROMPT },
        { role: 'user', content: PROMPTS.USER_PROMPT },
      ],
      temperature: 0.7,
    })

    if (!recipeData) {
      throw new Error('Recipe data not found')
    }

    await job.updateProgress(74)

    await db.$transaction([
      db.recipe.update({
        where: { id: recipe.id },
        data: {
          title: recipeData.title,
          description: recipeData.description,
          tagline: recipeData.tagline,
          cookTime: recipeData.cook_time_minutes,
          servings: recipeData.servings,
          difficulty: recipeData.difficulty as RecipeDifficulty,
          calories: recipeData.calories,
          protein: recipeData.protein_g,
          carbs: recipeData.carbs_g,
          fat: recipeData.fat_g,
          cookingSteps: recipeData.cooking_steps,
          ingredients: recipeData.ingredients,
          sourceMetadata: sourceData,
          sourceType: RecipeSourceType.INSTAGRAM_REEL,
          sourceUrl: job.data.url,
          sourceName: sourceData.ownerUsername,
        },
      }),
      db.recipeTag.createMany({
        data: recipeData.tags.map(tag => ({
          recipeId: recipe.id,
          tag: tag.value,
          type: tag.type as TagType,
        })),
        skipDuplicates: true,
      }),
    ])

    await job.updateProgress(80)

    const IMAGE_PROMPT = `A high-resolution, top-down food photograph of ${recipeData.title}, featuring ${recipeData.ingredients.map(ingredient => ingredient.name).join(', ')}, served on a matte blue ceramic plate with speckled texture, placed on a clean white background. Bright natural lighting from top, soft shadows, and minimal styling. Professional editorial food photo — appetizing, detailed, and realistic.`

    const imageResponse = await imageAi.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: IMAGE_PROMPT,
    })

    if (!imageResponse.candidates) {
      throw new Error('No image response from AI')
    }

    let imageBuffer: Buffer | undefined = undefined
    for (const part of imageResponse.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        const imageData = part.inlineData.data
        imageBuffer = Buffer.from(imageData ?? '', 'base64')
      }
    }

    const imageKey = `recipe-images/${recipe.id}-${Date.now()}.png`

    await s3.send(
      new PutObjectCommand({
        Bucket: 'culina-ai',
        Key: imageKey,
        Body: imageBuffer,
        ContentType: 'image/png',
      })
    )

    await job.updateProgress(90)

    await db.recipe.update({
      where: { id: recipe.id },
      data: {
        imageUrl: `${process.env.AWS_PUBLIC_URL_BASE}/${imageKey}`,
      },
    })

    return {
      recipeId: recipe.id,
      success: true,
    }
  },
  {
    connection: connectionOptions,
    ...workerOptions,
  }
)
  .on('active', async (job: Job<RecipeGenerationJobData, RecipeGenerationJobResult, string>) => {
    try {
      if (!job) {
        console.error('Job not found')
        return
      }

      await db.job.update({
        where: {
          bullJobId: job.id,
        },
        data: {
          status: JobStatus.RUNNING,
          startedAt: new Date(),
        },
      })
    } catch (error) {
      console.error('Error updating job active:', error)
    }
  })
  .on(
    'completed',
    async (
      job: Job<RecipeGenerationJobData, RecipeGenerationJobResult, string>,
      result: RecipeGenerationJobResult
    ) => {
      try {
        if (!job) {
          console.error('Job not found')
          return
        }

        await db.job.update({
          where: {
            bullJobId: job.id,
          },
          data: {
            progress: 100,
            status: JobStatus.COMPLETED,
            completedAt: new Date(),
            ...(result ? { resultData: result } : {}),
          },
        })
      } catch (error) {
        console.error('Error updating job completed:', error)
      }
    }
  )
  .on(
    'progress',
    async (
      job: Job<RecipeGenerationJobData, RecipeGenerationJobResult, string>,
      progress: JobProgress
    ) => {
      try {
        if (!job) {
          console.error('Job not found')
          return
        }

        await db.job.update({
          where: {
            bullJobId: job.id,
          },
          data: {
            progress: progress as number,
          },
        })
      } catch (error) {
        console.error('Error updating job progress:', error)
      }
    }
  )
  .on(
    'failed',
    async (
      job: Job<RecipeGenerationJobData, RecipeGenerationJobResult, string> | undefined,
      error: Error
    ) => {
      try {
        if (!job) {
          console.error('Job not found')
          return
        }

        await db.job.update({
          where: {
            bullJobId: job.id,
          },
          data: {
            status: JobStatus.FAILED,
            failedAt: new Date(),
            errorData: error.message,
          },
        })
      } catch (error) {
        console.error('Error updating job failed:', error)
      }
    }
  )
