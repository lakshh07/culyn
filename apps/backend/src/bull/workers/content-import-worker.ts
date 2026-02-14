import { connectionOptions, QUEUE_NAMES, workerOptions } from '@/bull/config'
import type { ContentImportJobData, ContentImportJobResult } from '@/bull/types'
import { S3_CONFIG, uploadRecipeImage, uploadToS3 } from '@/lib/aws/s3-helpers'
import { extractStructuredData, type ChatMessage } from '@/lib/llm'
import db from '@/lib/prisma'
import { placeAIService } from '@/lib/services/place/place-ai.service'
import { placeGeoService } from '@/lib/services/place/place-geo.service'
import { placePersistenceService } from '@/lib/services/place/place-persistence.service'
import { productAIService } from '@/lib/services/product/product-ai.service'
import { productPersistenceService } from '@/lib/services/product/product-persistence.service'
import { recipeAIService } from '@/lib/services/recipe/recipe-ai.service'
import { recipeImageService } from '@/lib/services/recipe/recipe-image.service'
import { recipePersistenceService } from '@/lib/services/recipe/recipe-persistence.service'
import { detectSourcePlatform, scrapeAndDownload } from '@/lib/source-scrapers'
import { JobStatus, RecipeSourceType, type ContentCategory } from '@prisma/client'
import { Worker, type Job } from 'bullmq'
import { randomUUID } from 'crypto'
import { z } from 'zod'

const ClassificationSchema = z.object({
  category: z.enum(['RECIPE', 'PLACE', 'PRODUCT']),
  confidence: z.number(),
  title: z.string(),
})

async function processContentImport(
  job: Job<ContentImportJobData, ContentImportJobResult>
): Promise<ContentImportJobResult> {
  const { userId, organizationId, url } = job.data

  try {
    await db.job.updateMany({
      where: { bullJobId: job.id },
      data: { status: JobStatus.RUNNING, startedAt: new Date() },
    })

    // ── Detect source platform ──
    const platform = detectSourcePlatform(url)
    if (platform === 'MANUAL') {
      throw new Error('Unsupported URL platform. Please use an Instagram, TikTok, or YouTube link.')
    }
    await job.updateProgress(5)

    // ── Scrape and download media ──
    const { scraped, media } = await scrapeAndDownload(url, platform)
    await job.updateProgress(15)

    const recordId = randomUUID()
    let videoS3Url: string | undefined
    let thumbnailS3Url: string | undefined

    if (media.video) {
      const result = await uploadToS3({
        key: `${S3_CONFIG.FOLDERS.CONTENT_VIDEOS}/${recordId}-${Date.now()}.mp4`,
        body: media.video.buffer,
        contentType: 'video/mp4',
      })
      videoS3Url = result.url
    }

    await job.updateProgress(30)

    if (media.thumbnail) {
      const result = await uploadToS3({
        key: `${S3_CONFIG.FOLDERS.CONTENT_THUMBNAILS}/${recordId}-${Date.now()}.jpg`,
        body: media.thumbnail.buffer,
        contentType: 'image/jpg',
      })
      thumbnailS3Url = result.url
    }
    await job.updateProgress(45)

    // ── AI classify content ──
    const classifyMessages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a content classification AI. Given a caption/description from a social media post, classify it into one of three categories: RECIPE (cooking, food preparation, ingredients), PLACE (restaurant, cafe, bar, travel spot, hotel), or PRODUCT (item to buy, review, skincare, tech, fashion). Return JSON with: category (RECIPE/PLACE/PRODUCT), confidence (0-1), and title (short descriptive title for the content). Return ONLY valid JSON.`,
      },
      {
        role: 'user',
        content: `Classify this social media content:\n\nCaption: ${scraped.caption}\n\nSource: @${scraped.ownerUsername}\nURL: ${url}`,
      },
    ]

    const { data: classification } = await extractStructuredData(
      classifyMessages,
      ClassificationSchema,
      { temperature: 0.2 }
    )
    const category = classification.category as ContentCategory
    await job.updateProgress(55)

    // ── CREATE STUB RECORD ──
    let slug: string = randomUUID()
    let createdRecordId: string

    const sourceData = {
      sourceType: platform,
      sourceUrl: url,
      sourceName: scraped.ownerUsername,
      sourceMetadata: {
        caption: scraped.caption,
        ownerUsername: scraped.ownerUsername,
        platform,
      },
    }

    switch (category) {
      case 'RECIPE': {
        const recipe = await db.recipe.create({
          data: {
            slug,
            user: { connect: { id: userId } },
            organization: { connect: { id: organizationId } },
            sourceType: platform as any,
            sourceUrl: url,
            sourceName: scraped.ownerUsername,
            sourceMetadata: sourceData.sourceMetadata,
            ...(videoS3Url && { sourceVideoUrl: videoS3Url }),
            ...(thumbnailS3Url && { sourceThumbnailUrl: thumbnailS3Url }),
          },
        })
        createdRecordId = recipe.id
        await db.recipeFavorite.create({
          data: { recipeId: recipe.id, userId },
        })
        break
      }
      case 'PLACE': {
        const place = await db.place.create({
          data: {
            slug,
            user: { connect: { id: userId } },
            organization: { connect: { id: organizationId } },
            sourceType: platform,
            sourceUrl: url,
            sourceName: scraped.ownerUsername,
            sourceMetadata: sourceData.sourceMetadata,
            ...(videoS3Url && { videoUrl: videoS3Url }),
            ...(thumbnailS3Url && { thumbnailUrl: thumbnailS3Url }),
          },
        })
        createdRecordId = place.id
        await db.placeFavorite.create({
          data: { placeId: place.id, userId },
        })
        break
      }
      case 'PRODUCT': {
        const product = await db.product.create({
          data: {
            slug,
            user: { connect: { id: userId } },
            organization: { connect: { id: organizationId } },
            sourceType: platform,
            sourceUrl: url,
            sourceName: scraped.ownerUsername,
            sourceMetadata: sourceData.sourceMetadata,
            ...(videoS3Url && { videoUrl: videoS3Url }),
            ...(thumbnailS3Url && { thumbnailUrl: thumbnailS3Url }),
          },
        })
        createdRecordId = product.id
        await db.productFavorite.create({
          data: { productId: product.id, userId },
        })
        break
      }
      default:
        throw new Error(`Unknown category: ${category}`)
    }
    await job.updateProgress(60)

    // ── AI extract structured data ──
    switch (category) {
      case 'RECIPE': {
        if (!media.video) {
          throw new Error('No video available for recipe extraction')
        }
        const recipeData = await recipeAIService.generateFromVideo({
          videoBuffer: media.video.buffer,
          caption: scraped.caption,
          recipeId: createdRecordId,
          userId,
        })

        slug = await recipePersistenceService.saveRecipe({
          recipeId: createdRecordId,
          recipeData,
          sourceUrl: url,
          sourceName: scraped.ownerUsername,
          sourceType: platform as RecipeSourceType,
          sourceMetadata: sourceData.sourceMetadata,
          videoUrl: videoS3Url,
          thumbnailUrl: thumbnailS3Url,
        })
        break
      }
      case 'PLACE': {
        if (!media.video) {
          throw new Error('No video available for place extraction')
        }

        const placeData = await placeAIService.generate({
          caption: scraped.caption,
          videoBuffer: media.video?.buffer,
          placeId: createdRecordId,
          userId,
        })

        // Geocode & enrich with Google Places API
        const geoResult = await placeGeoService.enrich({
          name: placeData.name,
          address: placeData.address,
          city: placeData.city,
          state: placeData.state,
          country: placeData.country,
          postal_code: placeData.postal_code,
        })

        if (geoResult) {
          placeData.latitude = geoResult.latitude
          placeData.longitude = geoResult.longitude
          placeData.phone_number = geoResult.phone_number || placeData.phone_number
          placeData.website = geoResult.website || placeData.website
          placeData.rating = geoResult.rating || placeData.rating
          placeData.price_range = geoResult.price_range || placeData.price_range
          placeData.hours = geoResult.hours || placeData.hours
        }

        slug = await placePersistenceService.savePlace({
          placeId: createdRecordId,
          placeData,
        })
        break
      }
      case 'PRODUCT': {
        if (!media.video) {
          throw new Error('No video available for recipe extraction')
        }

        const productData = await productAIService.generate({
          videoBuffer: media.video?.buffer,
          caption: scraped.caption,
          productId: createdRecordId,
          userId,
        })

        slug = await productPersistenceService.saveProduct({
          productId: createdRecordId,
          productData,
        })
        break
      }
    }

    await job.updateProgress(80)

    // ── GENERATE IMAGE ──
    switch (category) {
      case 'RECIPE': {
        try {
          const recipe = await db.recipe.findUnique({
            where: { id: createdRecordId },
            select: { ingredients: true, title: true },
          })

          if (recipe?.title) {
            // Re-read the full recipe data for image generation
            const fullRecipe = await db.recipe.findUnique({
              where: { id: createdRecordId },
            })

            if (fullRecipe) {
              const recipeForImage = {
                title: fullRecipe.title || '',
                short_title: fullRecipe.shortTitle || '',
                description: fullRecipe.description || '',
                calories: fullRecipe.calories || 0,
                carbs_g: Number(fullRecipe.carbs) || 0,
                protein_g: Number(fullRecipe.protein) || 0,
                fat_g: Number(fullRecipe.fat) || 0,
                tagline: fullRecipe.tagline || '',
                cook_time_minutes: fullRecipe.cookTime || 0,
                servings: fullRecipe.servings || 1,
                difficulty: (fullRecipe.difficulty || 'EASY') as 'EASY' | 'MEDIUM' | 'HARD',
                ingredients: (fullRecipe.ingredients as any[]) || [],
                cooking_steps: (fullRecipe.cookingSteps as any[]) || [],
                tags: [],
              }

              const imageBuffer = await recipeImageService.generateRecipeImage({
                recipe: recipeForImage,
                userId,
                recipeId: createdRecordId,
              })

              const imageResult = await uploadRecipeImage(
                imageBuffer,
                createdRecordId,
                S3_CONFIG.FOLDERS.RECIPE_IMAGES,
                'png'
              )

              await recipePersistenceService.updateRecipeImage(createdRecordId, imageResult.url)
            }
          }
        } catch (imageError) {
          console.error('[ContentImport] Failed to generate recipe image:', imageError)
          // Non-fatal: recipe is still usable without generated image
        }
        break
      }
      case 'PLACE': {
        if (thumbnailS3Url) {
          await placePersistenceService.updatePlaceImage(createdRecordId, thumbnailS3Url)
        }
        break
      }
      case 'PRODUCT': {
        if (thumbnailS3Url) {
          await productPersistenceService.updateProductImage(createdRecordId, thumbnailS3Url)
        }
        break
      }
    }

    await job.updateProgress(90)

    // ── FINALIZE ──
    const resultData = { category, slug, recordId: createdRecordId, success: true }

    await db.job.updateMany({
      where: { bullJobId: job.id },
      data: {
        status: JobStatus.COMPLETED,
        completedAt: new Date(),
        progress: 100,
        resultData,
      },
    })

    await job.updateProgress(100)

    return resultData
  } catch (error: any) {
    console.error('[ContentImport] Job failed:', error)

    await db.job.updateMany({
      where: { bullJobId: job.id },
      data: {
        status: JobStatus.FAILED,
        failedAt: new Date(),
        errorData: { message: error.message },
      },
    })

    return {
      category: 'RECIPE',
      slug: '',
      recordId: '',
      success: false,
      error: error.message,
    }
  }
}

let contentImportWorker: Worker<ContentImportJobData, ContentImportJobResult> | null = null

export function startContentImportWorker() {
  contentImportWorker = new Worker<ContentImportJobData, ContentImportJobResult>(
    QUEUE_NAMES.CONTENT_IMPORT,
    processContentImport,
    {
      connection: connectionOptions,
      ...workerOptions,
    }
  )

  contentImportWorker.on('active', job => {
    console.log(`[ContentImport] Job ${job.id} started processing`)
  })

  contentImportWorker.on('completed', job => {
    console.log(`[ContentImport] Job ${job.id} completed`)
  })

  contentImportWorker.on('progress', (job, progress) => {
    console.log(`[ContentImport] Job ${job.id} progress: ${progress}%`)
  })

  contentImportWorker.on('failed', (job, err) => {
    console.error(`[ContentImport] Job ${job?.id} failed:`, err.message)
  })

  return contentImportWorker
}

export function stopContentImportWorker() {
  return contentImportWorker?.close()
}
