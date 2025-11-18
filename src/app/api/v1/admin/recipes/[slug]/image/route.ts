import { HttpException } from '@/exceptions/http-exceptions'
import { S3_CONFIG, uploadRecipeImage } from '@/lib/aws/s3-helpers'
import { ErrorResponse } from '@/lib/http'
import db from '@/lib/prisma'
import { recipeImageService } from '@/lib/services/recipe/recipe-image.service'
import { CreateRecipeRequest } from '@/schema/create-recipe'
import { NextRequest, NextResponse } from 'next/server'

interface NextRequestContext {
  params: Promise<{ slug: string }>
}

export async function POST(req: NextRequest, ctx: NextRequestContext) {
  try {
    const { slug } = await ctx.params

    const recipe = await db.recipe.findUnique({
      where: { slug },
    })

    if (!recipe) {
      throw new HttpException('NOT_FOUND', {
        name: 'RecipeNotFoundError',
        message: 'Recipe not found',
      })
    }

    const image = await recipeImageService.generateRecipeImage({
      recipe: recipe as unknown as CreateRecipeRequest,
      userId: recipe.userId!,
      recipeId: recipe.id,
    })

    const imageUpload = await uploadRecipeImage(
      image,
      recipe.id,
      S3_CONFIG.FOLDERS.RECIPE_IMAGES,
      'png'
    )

    await db.recipe.update({
      where: { id: recipe.id },
      data: { imageUrl: imageUpload.url },
    })

    return NextResponse.json({ status: 201 })
  } catch (error) {
    return new ErrorResponse().from(error)
  }
}
