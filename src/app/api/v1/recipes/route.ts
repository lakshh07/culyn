import db from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { ErrorResponse } from '@/lib/http'
import { HttpException } from '@/exceptions/http-exceptions'
import { auth } from '@/lib/auth'
import z from 'zod'

export async function GET(req: NextRequest) {
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

    const filters = await z
      .object({
        tagId: z.string().optional(),
        sortBy: z.enum(['newest', 'oldest', 'popular', 'random']).optional().default('newest'),
        q: z.string().optional(),
      })
      .parseAsync(Object.fromEntries(req.nextUrl.searchParams))

    let orderBy:
      | { createdAt?: 'asc' | 'desc'; RecipeFavorite?: { _count: 'desc' } }[]
      | { createdAt: 'asc' | 'desc' } = { createdAt: 'desc' } // default to newest

    switch (filters.sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'popular':
        orderBy = [{ RecipeFavorite: { _count: 'desc' } }, { createdAt: 'desc' }]
        break
      case 'random':
        // For random, we'll use a different approach after the query
        orderBy = { createdAt: 'desc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    const recipes = await db.recipe.findMany({
      where: {
        ...(filters.tagId && {
          tags: {
            some: {
              tagId: filters.tagId,
              deletedAt: null,
            },
          },
        }),
        ...(filters.q && {
          OR: [
            {
              title: {
                contains: filters.q,
                mode: 'insensitive',
              },
            },
            {
              shortTitle: {
                contains: filters.q,
                mode: 'insensitive',
              },
            },
            {
              RecipeIngredient: {
                some: {
                  ingredient: {
                    name: {
                      contains: filters.q,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            },
            {
              tags: {
                some: {
                  tag: {
                    name: {
                      contains: filters.q,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            },
          ],
        }),
      },
      include: {
        tags: {
          where: {
            deletedAt: null,
          },
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
        RecipeIngredient: {
          where: {
            deletedAt: null,
          },
          include: {
            ingredient: {
              select: {
                id: true,
                name: true,
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
        _count: {
          select: {
            RecipeFavorite: true,
          },
        },
      },
      orderBy,
    })

    // Handle random sorting after query execution
    let finalRecipes = recipes
    if (filters.sortBy === 'random') {
      finalRecipes = recipes.sort(() => Math.random() - 0.5)
    }

    return NextResponse.json(finalRecipes)
  } catch (error) {
    return new ErrorResponse().from(error)
  }
}
