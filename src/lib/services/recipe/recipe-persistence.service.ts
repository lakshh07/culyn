import db from '@/lib/prisma'
import { CreateRecipeRequest } from '@/schema/create-recipe'
import { RecipeDifficulty, TagType } from '@/generated/prisma/enums'
import { parseQuantity } from '@/lib/recipe/ingredient-parser'
import slugify from 'slugify'
import { BaseRecipeSourceData } from '@/lib/recipe-sources'

/**
 * Options for saving a recipe
 */
export interface SaveRecipeOptions {
  recipeId: string
  recipeData: CreateRecipeRequest
  sourceData: BaseRecipeSourceData
  sourceUrl: string
  videoUrl?: string
  thumbnailUrl?: string
  imageUrl?: string
}

/**
 * Options for favoriting a recipe
 */
export interface FavoriteRecipeOptions {
  recipeId: string
  userId: string
}

/**
 * Service for persisting recipe data to database
 */
export class RecipePersistenceService {
  /**
   * Save complete recipe data to database
   * @param options Save options
   */
  async saveRecipe(options: SaveRecipeOptions): Promise<void> {
    const { recipeId, recipeData, sourceData, sourceUrl, videoUrl, thumbnailUrl, imageUrl } =
      options

    await db.recipe.update({
      where: { id: recipeId },
      data: {
        title: recipeData.title,
        shortTitle: recipeData.short_title,
        slug: slugify(recipeData.short_title, { lower: true, strict: true }),
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
        sourceMetadata: JSON.stringify(sourceData),
        sourceType: sourceData.sourceType,
        sourceUrl,
        sourceName: sourceData.ownerUsername,
        ...(videoUrl && { sourceVideoUrl: videoUrl }),
        ...(thumbnailUrl && { sourceThumbnailUrl: thumbnailUrl }),
        ...(imageUrl && { imageUrl }),
      },
    })

    // Save tags
    await this.saveTags(recipeId, recipeData.tags)

    // Save ingredients
    await this.saveIngredients(recipeId, recipeData.ingredients)
  }

  /**
   * Update recipe image URL
   */
  async updateRecipeImage(recipeId: string, imageUrl: string): Promise<void> {
    await db.recipe.update({
      where: { id: recipeId },
      data: { imageUrl, metadata: {} },
    })
  }

  /**
   * Save recipe tags
   */
  private async saveTags(
    recipeId: string,
    tags: Array<{ type: string; value: string }>
  ): Promise<void> {
    await Promise.all(
      tags.map(async tagData => {
        const slug = slugify(tagData.value, { lower: true, strict: true })
        const tag = await db.tag.upsert({
          where: { slug },
          update: {},
          create: {
            name: tagData.value,
            slug,
            type: tagData.type as TagType,
          },
        })

        return db.recipeTag.upsert({
          where: {
            recipeId_tagId: {
              recipeId,
              tagId: tag.id,
            },
          },
          update: {},
          create: {
            recipeId,
            tagId: tag.id,
          },
        })
      })
    )
  }

  /**
   * Save recipe ingredients
   */
  private async saveIngredients(
    recipeId: string,
    ingredients: Array<{ name: string; quantity: string }>
  ): Promise<void> {
    const ingredientPromises = ingredients.map(async ingredientData => {
      try {
        const { amount, unit } = parseQuantity(ingredientData.quantity)
        const normalizedName = ingredientData.name.toLowerCase().trim()
        const slug = slugify(normalizedName, { lower: true, strict: true })

        const ingredient = await db.ingredient.upsert({
          where: { slug },
          update: {},
          create: {
            name: normalizedName,
            slug,
          },
        })

        const decimalAmount = amount !== null ? amount : null

        return await db.recipeIngredient.upsert({
          where: {
            recipeId_ingredientId: {
              recipeId,
              ingredientId: ingredient.id,
            },
          },
          update: {},
          create: {
            recipeId,
            ingredientId: ingredient.id,
            amount: decimalAmount,
            unit: unit,
          },
        })
      } catch (error) {
        console.error(`Failed to process ingredient "${ingredientData.name}":`, error)
        return null
      }
    })

    const ingredientResults = await Promise.all(ingredientPromises)
    const successfulIngredients = ingredientResults.filter(Boolean)

    if (successfulIngredients.length === 0) {
      throw new Error('Failed to process any ingredients')
    }

    if (successfulIngredients.length < ingredients.length) {
      console.warn(
        `Only ${successfulIngredients.length}/${ingredients.length} ingredients processed successfully`
      )
    }
  }

  /**
   * Add recipe to user's favorites
   */
  async favoriteRecipe(options: FavoriteRecipeOptions): Promise<void> {
    const { recipeId, userId } = options

    await db.recipeFavorite.create({
      data: {
        recipeId,
        userId,
      },
    })
  }
}

/**
 * Singleton instance
 */
export const recipePersistenceService = new RecipePersistenceService()
