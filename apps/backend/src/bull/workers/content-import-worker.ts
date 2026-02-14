import { connectionOptions, QUEUE_NAMES, workerOptions } from '@/bull/config'
import type { ContentImportJobData, ContentImportJobResult } from '@/bull/types'
import { S3_CONFIG, uploadRecipeImage, uploadToS3 } from '@/lib/aws/s3-helpers'
import { extractStructuredData, type ChatMessage } from '@/lib/llm'
import db from '@/lib/prisma'
import { recipeAIService } from '@/lib/services/recipe/recipe-ai.service'
import { recipeImageService } from '@/lib/services/recipe/recipe-image.service'
import { recipePersistenceService } from '@/lib/services/recipe/recipe-persistence.service'
import { detectSourcePlatform, scrapeAndDownload } from '@/lib/source-scrapers'
import { CreatePlaceRequestSchema, CreateProductRequestSchema } from '@culyn/shared/schemas'
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

        await recipePersistenceService.saveRecipe({
          recipeId: createdRecordId,
          recipeData,
          sourceUrl: url,
          sourceName: scraped.ownerUsername,
          sourceType: platform as RecipeSourceType,
          sourceMetadata: sourceData.sourceMetadata,
          videoUrl: videoS3Url,
          thumbnailUrl: thumbnailS3Url,
        })

        // Update slug from recipe data
        const updatedRecipe = await db.recipe.findUnique({
          where: { id: createdRecordId },
          select: { slug: true },
        })
        if (updatedRecipe) slug = updatedRecipe.slug
        break
      }
      case 'PLACE': {
        const placeMessages: ChatMessage[] = [
          {
            role: 'system',
            content: `You are a data extraction assistant. Extract structured place/restaurant/cafe information from social media content. Return a JSON object with the place details. If you cannot determine a field, omit it or set it to null.`,
          },
          {
            role: 'user',
            content: `Extract place information from this social media post:\n\nCaption: ${scraped.caption}\nAuthor: @${scraped.ownerUsername}\nURL: ${url}\n\nReturn a JSON object with these fields: name, short_name, description, type (one of: RESTAURANT, CAFE, BAR, BAKERY, FOOD_TRUCK, MARKET, GROCERY_STORE, SPECIALTY_SHOP, OTHER), address, city, state, country, latitude, longitude, phone_number, website, price_range, cuisine, rating, notes, tags (array of {type, value}).`,
          },
        ]

        const { data: placeData } = await extractStructuredData(
          placeMessages,
          CreatePlaceRequestSchema,
          { temperature: 0.3 }
        )

        const placeSlug =
          placeData.name
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') || slug

        await db.place.update({
          where: { id: createdRecordId },
          data: {
            slug: placeSlug,
            name: placeData.name,
            shortName: placeData.short_name,
            description: placeData.description,
            type: placeData.type,
            address: placeData.address,
            city: placeData.city,
            state: placeData.state,
            country: placeData.country,
            postalCode: placeData.postal_code,
            latitude: placeData.latitude,
            longitude: placeData.longitude,
            phoneNumber: placeData.phone_number,
            website: placeData.website,
            priceRange: placeData.price_range,
            cuisine: placeData.cuisine,
            rating: placeData.rating,
            notes: placeData.notes,
          },
        })
        slug = placeSlug

        if (placeData.tags && placeData.tags.length > 0) {
          for (const tagData of placeData.tags) {
            const tagSlug = tagData.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            const tag = await db.tag.upsert({
              where: { slug: tagSlug },
              create: { slug: tagSlug, name: tagData.value, type: tagData.type as any },
              update: {},
            })
            await db.placeTag
              .create({ data: { placeId: createdRecordId, tagId: tag.id } })
              .catch(() => {})
          }
        }
        break
      }
      case 'PRODUCT': {
        const productMessages: ChatMessage[] = [
          {
            role: 'system',
            content: `You are a data extraction assistant. Extract structured product information from social media content. Return a JSON object with the product details. If you cannot determine a field, omit it or set it to null.`,
          },
          {
            role: 'user',
            content: `Extract product information from this social media post:\n\nCaption: ${scraped.caption}\nAuthor: @${scraped.ownerUsername}\nURL: ${url}\n\nReturn a JSON object with these fields: name, short_name, description, category (one of: BEAUTY, TECH, FASHION, KITCHEN, HOME, HEALTH, SPORTS, BOOKS, TOYS, OTHER), brand, model_number, price, currency, purchase_url, specifications, features (array of strings), notes, tags (array of {type, value}).`,
          },
        ]

        const { data: productData } = await extractStructuredData(
          productMessages,
          CreateProductRequestSchema,
          { temperature: 0.3 }
        )

        const productSlug =
          productData.name
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') || slug

        await db.product.update({
          where: { id: createdRecordId },
          data: {
            slug: productSlug,
            name: productData.name,
            shortName: productData.short_name,
            description: productData.description,
            category: productData.category,
            brand: productData.brand,
            modelNumber: productData.model_number,
            price: productData.price,
            currency: productData.currency,
            purchaseUrl: productData.purchase_url,
            specifications: productData.specifications,
            features: productData.features,
            notes: productData.notes,
          },
        })
        slug = productSlug

        if (productData.tags && productData.tags.length > 0) {
          for (const tagData of productData.tags) {
            const tagSlug = tagData.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            const tag = await db.tag.upsert({
              where: { slug: tagSlug },
              create: { slug: tagSlug, name: tagData.value, type: tagData.type as any },
              update: {},
            })
            await db.productTag
              .create({ data: { productId: createdRecordId, tagId: tag.id } })
              .catch(() => {})
          }
        }
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
        // Use thumbnail as image
        if (thumbnailS3Url) {
          await db.place.update({
            where: { id: createdRecordId },
            data: { imageUrl: thumbnailS3Url },
          })
        }
        break
      }
      case 'PRODUCT': {
        // Use thumbnail as image
        if (thumbnailS3Url) {
          await db.product.update({
            where: { id: createdRecordId },
            data: { imageUrl: thumbnailS3Url },
          })
        }
        break
      }
    }
    await job.updateProgress(90)

    // ── Step 9 (100%): FINALIZE ──
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
