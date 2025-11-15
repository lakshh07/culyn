import { Job, JobProgress, Worker } from 'bullmq'
import { connectionOptions, QUEUE_NAMES, workerOptions } from '@/bull/config'
import { RecipeGenerationJobData, RecipeGenerationJobResult } from '@/bull/types'
import db from '@/lib/prisma'
import { JobStatus } from '@/generated/prisma/enums'
import { recipeSourceRegistry } from '@/lib/recipe-sources'
import {
  fetchAndUploadRecipeVideo,
  fetchAndUploadRecipeImage,
  uploadRecipeImage,
  S3_CONFIG,
} from '@/lib/aws/s3-helpers'
import { recipeAIService, recipeImageService, recipePersistenceService } from '@/lib/services'

new Worker<RecipeGenerationJobData, RecipeGenerationJobResult>(
  QUEUE_NAMES.RECIPE_GENERATION,
  async job => {
    await job.updateProgress(0)

    const [user, organization] = await Promise.all([
      db.user.findUnique({
        where: { id: job.data.userId },
      }),
      db.organization.findUnique({
        where: { id: job.data.organizationId },
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

    const sourceHandler = recipeSourceRegistry.getHandler(job.data.sourceType)
    const { sourceData, media } = await sourceHandler.fetchSourceData(job.data.url)

    if (!sourceData.caption || !media.video || !media.thumbnail) {
      throw new Error('Incomplete source data: missing caption, video, or thumbnail')
    }

    await job.updateProgress(35)

    const [videoUpload, thumbnailUpload] = await Promise.all([
      fetchAndUploadRecipeVideo(media.video.url, recipe.id),
      fetchAndUploadRecipeImage(
        media.thumbnail.url,
        recipe.id,
        S3_CONFIG.FOLDERS.RECIPE_THUMBNAILS
      ),
    ])

    await job.updateProgress(45)

    const recipeData = await recipeAIService.generateFromVideo({
      videoBuffer: media.video.buffer,
      caption: sourceData.caption,
      recipeId: recipe.id,
      userId: user.id,
    })

    await job.updateProgress(68)

    await recipePersistenceService.saveRecipe({
      recipeId: recipe.id,
      recipeData,
      sourceData,
      sourceUrl: job.data.url,
      videoUrl: videoUpload.url,
      thumbnailUrl: thumbnailUpload.url,
    })

    await job.updateProgress(75)

    const imageBuffer = await recipeImageService.generateRecipeImage({
      recipe: recipeData,
      userId: user.id,
      recipeId: recipe.id,
    })

    const imageUpload = await uploadRecipeImage(
      imageBuffer,
      recipe.id,
      S3_CONFIG.FOLDERS.RECIPE_IMAGES,
      'png'
    )

    await job.updateProgress(90)

    await recipePersistenceService.updateRecipeImage(recipe.id, imageUpload.url)

    await recipePersistenceService.favoriteRecipe({
      recipeId: recipe.id,
      userId: user.id,
    })

    await job.updateProgress(100)

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
