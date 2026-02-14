import db from '@/lib/prisma'
import { parseQuantity } from '@/lib/recipe/ingredient-parser'
import type { CreateRecipeRequest } from '@culyn/shared/schemas'
import { RecipeDifficulty, TagType, type RecipeSourceType } from '@prisma/client'
import slugify from 'slugify'

export interface SaveRecipeOptions {
  recipeId: string
  recipeData: CreateRecipeRequest
  sourceUrl: string
  sourceName: string
  sourceType: RecipeSourceType
  sourceMetadata: Record<string, unknown>
  videoUrl?: string
  thumbnailUrl?: string
  imageUrl?: string
}

export class RecipePersistenceService {
  async saveRecipe(options: SaveRecipeOptions): Promise<string> {
    const {
      recipeId,
      recipeData,
      sourceUrl,
      sourceName,
      sourceType,
      sourceMetadata,
      videoUrl,
      thumbnailUrl,
      imageUrl,
    } = options

    const slug = slugify(recipeData.short_title, { lower: true, strict: true })

    await db.recipe.update({
      where: { id: recipeId },
      data: {
        title: recipeData.title,
        shortTitle: recipeData.short_title,
        slug,
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
        sourceMetadata: JSON.stringify(sourceMetadata),
        sourceType,
        sourceUrl,
        sourceName,
        ...(videoUrl && { sourceVideoUrl: videoUrl }),
        ...(thumbnailUrl && { sourceThumbnailUrl: thumbnailUrl }),
        ...(imageUrl && { imageUrl }),
      },
    })

    await this.saveTags(recipeId, recipeData.tags)
    await this.saveIngredients(recipeId, recipeData.ingredients)

    return slug
  }

  async updateRecipeImage(recipeId: string, imageUrl: string): Promise<void> {
    await db.recipe.update({
      where: { id: recipeId },
      data: { imageUrl },
    })
  }

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
            amount: amount,
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
}

export const recipePersistenceService = new RecipePersistenceService()
