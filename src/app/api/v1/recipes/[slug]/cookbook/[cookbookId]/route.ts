import { auth } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { ErrorResponse } from '@/lib/http'
import { HttpException } from '@/exceptions/http-exceptions'
import db from '@/lib/prisma'

interface NextRequestContext {
  params: Promise<{ slug: string; cookbookId: string }>
}

export async function DELETE(req: NextRequest, ctx: NextRequestContext) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session) {
      throw new HttpException('UNAUTHORIZED', {
        name: 'AuthenticationError',
        message: 'You are not authenticated, please login',
      })
    }

    const params = await ctx.params

    const recipe = await db.recipe.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    })

    if (!recipe) {
      throw new HttpException('NOT_FOUND', {
        name: 'RecipeNotFoundError',
        message: 'Recipe not found',
      })
    }

    const existingFavorite = await db.recipeFavorite.findUnique({
      where: {
        id: params.cookbookId,
        recipeId_userId: {
          recipeId: recipe.id,
          userId: session.user.id,
        },
      },
    })

    if (!existingFavorite || existingFavorite.deletedAt) {
      throw new HttpException('NOT_FOUND', {
        name: 'FavoriteNotFoundError',
        message: 'Recipe is not in your favorites',
      })
    }

    await db.recipeFavorite.update({
      where: { id: existingFavorite.id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    return new ErrorResponse().from(error)
  }
}
