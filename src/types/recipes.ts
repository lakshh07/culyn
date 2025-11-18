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

export type FullRecipe = Recipe & {
  RecipeTag: {
    tag: {
      name: string
      slug: string
    }
  }[]
  RecipeFavorite: {
    id: string
  }[]
  RecipeIngredient: {
    ingredient: {
      id: string
      name: string
      slug: string
    }
    amount: string
    unit: string
  }[]
}

export type RecipeCookbook = {
  id: string
  recipe: {
    id: string
    slug: string
    title: string
    shortTitle: string
    imageUrl: string
    sourceName: string
    cookTime: number
    metadata: {
      jobId: string
    }
  }
}
