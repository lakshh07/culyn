import { HttpException } from '@/exceptions/http-exceptions'
import { auth } from '@/lib/auth'
import { ErrorResponse } from '@/lib/http'
import db from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
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
        recipeId: z.string().optional(),
      })
      .parseAsync(Object.fromEntries(req.nextUrl.searchParams))

    const lists = await db.groceryList.findMany({
      where: {
        userId: session.user.id,
        ...(filters.recipeId && {
          items: {
            some: {
              recipeId: filters.recipeId,
            },
          },
        }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        completed: true,
        deletedAt: true,
        items: {
          where: {
            deletedAt: null, // Only return non-deleted items
          },
          select: {
            id: true,
            name: true,
            amount: true,
            unit: true,
            checked: true,
            notes: true,
            ingredientId: true,
            recipe: { select: { slug: true } },
          },
        },
      },
    })

    return NextResponse.json(lists)
  } catch (error) {
    return new ErrorResponse().from(error)
  }
}

export async function POST(req: NextRequest) {
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

    const payload = await z
      .union([
        z
          .object({
            recipeSlug: z.string().min(1, 'Recipe slug is required'),
            ingredientIds: z
              .array(z.string())
              .min(1, 'Ingredient IDs are required when creating a new grocery list'),
          })
          .strict(),
        z
          .object({
            recipeSlug: z.string().min(1, 'Recipe slug is required'),
            ingredientIds: z.array(z.string()),
            groceryListId: z.string().min(1, 'Grocery list ID is required'),
          })
          .strict(),
      ])
      .parseAsync(await req.json())

    const recipe = await db.recipe.findUnique({
      where: {
        slug: payload.recipeSlug,
      },
      select: {
        id: true,
        title: true,
        shortTitle: true,
      },
    })

    if (!recipe) {
      throw new HttpException('NOT_FOUND', {
        name: 'RecipeNotFoundError',
        message: 'Recipe not found',
      })
    }

    const recipeIngredients =
      payload.ingredientIds.length > 0
        ? await db.recipeIngredient.findMany({
            where: {
              ingredientId: { in: payload.ingredientIds },
            },
            select: {
              id: true,
              amount: true,
              unit: true,
              ingredient: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          })
        : []

    if (
      payload.ingredientIds.length > 0 &&
      recipeIngredients.length !== payload.ingredientIds.length
    ) {
      throw new HttpException('NOT_FOUND', {
        name: 'RecipeIngredientsNotFoundError',
        message: 'Recipe ingredients not found',
      })
    }

    if ('groceryListId' in payload) {
      const groceryList = await db.groceryList.findUnique({
        where: {
          id: payload.groceryListId,
        },
      })

      if (groceryList?.deletedAt) {
        await db.groceryList.update({
          where: { id: groceryList.id },
          data: { completed: false, deletedAt: null },
        })
      }

      if (!groceryList) {
        throw new HttpException('NOT_FOUND', {
          name: 'GroceryListNotFoundError',
          message: 'Grocery list not found',
        })
      }

      const existingItems = await db.listItem.findMany({
        where: {
          listId: groceryList.id,
        },
        select: {
          id: true,
          ingredientId: true,
          deletedAt: true,
        },
      })

      await db.$transaction(async tx => {
        const itemsToRestore = existingItems.filter(
          ei => ei.deletedAt && payload.ingredientIds.includes(ei.ingredientId!)
        )

        const itemsToDelete = existingItems.filter(
          ei => ei.deletedAt === null && !payload.ingredientIds.includes(ei.ingredientId!)
        )

        const newItems = recipeIngredients.filter(
          ri => !existingItems.some(ei => ei.ingredientId === ri.ingredient.id)
        )

        if (itemsToRestore.length > 0) {
          await tx.listItem.updateMany({
            where: {
              id: { in: itemsToRestore.map(item => item.id) },
            },
            data: {
              deletedAt: null,
            },
          })
        }

        if (itemsToDelete.length > 0) {
          await tx.listItem.updateMany({
            where: {
              id: { in: itemsToDelete.map(item => item.id) },
            },
            data: {
              checked: false,
              notes: null,
              deletedAt: new Date(),
            },
          })
        }

        if (newItems.length > 0) {
          await tx.listItem.createMany({
            data: newItems.map(ri => ({
              listId: groceryList.id,
              ingredientId: ri.ingredient.id,
              recipeId: recipe.id,
              name: ri.ingredient.name,
              amount: ri.amount,
              unit: ri.unit,
            })),
          })
        }
      })

      return NextResponse.json({ message: 'List items added successfully' }, { status: 201 })
    }

    await db.$transaction(async tx => {
      const groceryList = await tx.groceryList.create({
        data: {
          name: recipe.shortTitle ?? recipe.title ?? 'Grocery List',
          userId: session.user.id,
        },
      })

      await tx.listItem.createMany({
        data: recipeIngredients.map(ri => ({
          listId: groceryList.id,
          ingredientId: ri.ingredient.id,
          recipeId: recipe.id,
          name: ri.ingredient.name,
          amount: ri.amount,
          unit: ri.unit,
        })),
      })
    })

    return NextResponse.json({ message: 'List items added successfully' }, { status: 201 })
  } catch (error) {
    return new ErrorResponse().from(error)
  }
}
