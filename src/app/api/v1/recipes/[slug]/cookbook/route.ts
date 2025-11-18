import db from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { ErrorResponse } from '@/lib/http'
import { HttpException } from '@/exceptions/http-exceptions'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { SubscriptionService } from '@/lib/services/subscription'

interface NextRequestContext {
  params: Promise<{ slug: string }>
}

const favoriteParamsSchema = z.object({
  slug: z.string().min(1, 'Recipe slug is required'),
})

export async function POST(req: NextRequest, ctx: NextRequestContext) {
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

    await SubscriptionService.enforceCookbookLimit(session.user.id)

    const params = await ctx.params
    const { slug } = await favoriteParamsSchema.parseAsync(params)

    const recipe = await db.recipe.findUnique({
      where: { slug },
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
        recipeId_userId: {
          recipeId: recipe.id,
          userId: session.user.id,
        },
      },
    })

    if (existingFavorite) {
      if (!existingFavorite.deletedAt) {
        return NextResponse.json(
          { message: 'Recipe is already in your favorites' },
          { status: 200 }
        )
      } else {
        const restoredFavorite = await db.recipeFavorite.update({
          where: { id: existingFavorite.id },
          data: {
            deletedAt: null,
            updatedAt: new Date(),
          },
        })

        return NextResponse.json(
          {
            message: 'Recipe added to favorites',
            favorite: restoredFavorite,
          },
          { status: 200 }
        )
      }
    }

    await db.recipeFavorite.create({
      data: {
        recipeId: recipe.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json(
      {
        message: 'Recipe added to favorites',
      },
      { status: 201 }
    )
  } catch (error) {
    return new ErrorResponse().from(error)
  }
}
