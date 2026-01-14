import { connectionOptions, defaultJobOptions, QUEUE_NAMES } from '@/bull/config'
import type { RecipeGenerationJobData, RecipeGenerationJobResult } from '@/bull/types'
import { Queue } from 'bullmq'

const generateRecipesQueue = new Queue<RecipeGenerationJobData, RecipeGenerationJobResult>(
  QUEUE_NAMES.RECIPE_GENERATION,
  {
    connection: connectionOptions,
    defaultJobOptions,
  }
)

export { generateRecipesQueue }
