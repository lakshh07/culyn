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
        cookTimeMin: z.coerce.number().optional(),
        cookTimeMax: z.coerce.number().optional(),
        caloriesMin: z.coerce.number().optional(),
        caloriesMax: z.coerce.number().optional(),
        proteinMin: z.coerce.number().optional(),
        proteinMax: z.coerce.number().optional(),
        ingredientIds: z.string().optional(), // comma-separated ingredient IDs
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

    // Parse ingredient IDs if provided
    const ingredientIdsArray = filters.ingredientIds
      ? filters.ingredientIds.split(',').filter(id => id.trim())
      : []

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
        // Cooking time filter
        ...(filters.cookTimeMin !== undefined && {
          cookTime: {
            gte: filters.cookTimeMin,
          },
        }),
        ...(filters.cookTimeMax !== undefined && {
          cookTime: {
            lte: filters.cookTimeMax,
          },
        }),
        // Calories filter
        ...(filters.caloriesMin !== undefined && {
          calories: {
            gte: filters.caloriesMin,
          },
        }),
        ...(filters.caloriesMax !== undefined && {
          calories: {
            lte: filters.caloriesMax,
          },
        }),
        // Protein filter
        ...(filters.proteinMin !== undefined && {
          protein: {
            gte: filters.proteinMin,
          },
        }),
        ...(filters.proteinMax !== undefined && {
          protein: {
            lte: filters.proteinMax,
          },
        }),
        // Ingredients filter - recipes must contain ALL selected ingredients
        ...(ingredientIdsArray.length > 0 && {
          AND: ingredientIdsArray.map(ingredientId => ({
            RecipeIngredient: {
              some: {
                ingredientId,
                deletedAt: null,
              },
            },
          })),
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
