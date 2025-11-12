import { auth } from '@/lib/auth'
import { ErrorResponse } from '@/lib/http'
import { HttpException } from '@/exceptions/http-exceptions'
import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/prisma'

interface NextRequestContext {
  params: Promise<{ slug: string }>
}

export async function GET(req: NextRequest, ctx: NextRequestContext) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })
    const params = await ctx.params

    if (!session) {
      throw new HttpException('UNAUTHORIZED', {
        name: 'AuthenticationError',
        message: 'You are not authenticated, please login',
      })
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: { id: true, organizationsOwned: { select: { id: true } } },
    })

    if (!user?.id || !user.organizationsOwned.length || user.organizationsOwned.length > 1) {
      throw new HttpException('NOT_FOUND', {
        name: 'UserOrOrganizationNotFoundError',
        message: 'User or organization not found',
      })
    }

    const recipe = await db.recipe.findUnique({
      where: {
        slug: params.slug,
        userId: user.id,
      },
      include: {
        RecipeIngredient: {
          select: {
            amount: true,
            unit: true,
            ingredient: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        RecipeFavorite: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
          },
        },
      },
    })

    if (!recipe) {
      throw new HttpException('NOT_FOUND', {
        name: 'RecipeNotFoundError',
        message: 'Recipe not found',
      })
    }

    return NextResponse.json(recipe)
  } catch (error) {
    return new ErrorResponse().from(error)
  }
}
