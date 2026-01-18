import { auth } from '@/lib/auth'
import db from '@/lib/prisma'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import z from 'zod'

const lists = new Hono()

// GET /lists - Get all grocery lists for user
lists.get('/', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const queries = c.req.queries() || {}
  const queryParams = Object.fromEntries(
    Object.entries(queries).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  )

  const filters = await z
    .object({
      recipeId: z.string().optional(),
    })
    .parseAsync(queryParams)

  const groceryLists = await db.groceryList.findMany({
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
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          amount: true,
          unit: true,
          checked: true,
          notes: true,
          ingredientId: true,
          recipe: { select: { slug: true, servings: true } },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return c.json(groceryLists)
})

// POST /lists - Create grocery list or add items to existing list
lists.post('/', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
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
    .parseAsync(await c.req.json())

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
    throw new HTTPException(404, {
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
    throw new HTTPException(404, {
      message: 'Recipe ingredients not found',
    })
  }

  // If updating an existing grocery list
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
      throw new HTTPException(404, {
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

    return c.json({ message: 'List items added successfully' }, 201)
  }

  // Creating a new grocery list
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

  return c.json({ message: 'List items added successfully' }, 201)
})

export default lists
