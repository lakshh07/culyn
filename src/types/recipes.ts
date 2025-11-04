import { Recipe } from '@/generated/prisma/client'

export type CookingStep = {
  step_number: number
  step_description: string
  tools_required: string[]
  ingredients_used: {
    name: string
    quantity: string
  }[]
}

export type RecipeWithIngredients = Recipe & {
  RecipeIngredient: {
    ingredient: {
      name: string
      slug: string
    }
    amount: string
    unit: string
  }[]
}
