import { RecipeSourceType } from '@prisma/client'

export type RecipeGenerationJobData = {
  userId: string
  organizationId: string
  recipeId: string
  url: string
  sourceType: RecipeSourceType
}

export type RecipeGenerationJobResult = {
  recipeId: string
  success: boolean
  error?: string
}
