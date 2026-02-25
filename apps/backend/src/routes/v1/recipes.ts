import { auth } from '@/lib/auth'
import db from '@/lib/prisma'
import { enforceLibraryLimit } from '@/lib/subscription'
import {
  ListRecipesQuerySchema,
  UpdateListItemRequestSchema,
} from '@culyn/shared/schemas'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

const recipes = new Hono()

// GET /recipes - List recipes with filters
recipes.get('/', async c => {
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

  const filters = await ListRecipesQuerySchema.parseAsync(queryParams)

  let orderBy:
    | { createdAt?: 'asc' | 'desc'; RecipeFavorite?: { _count: 'desc' } }[]
    | { createdAt: 'asc' | 'desc' } = { createdAt: 'desc' }

  switch (filters.sortBy) {
    case 'oldest':
      orderBy = { createdAt: 'asc' }
      break
    case 'popular':
      orderBy = [{ RecipeFavorite: { _count: 'desc' } }, { createdAt: 'desc' }]
      break
    case 'random':
      orderBy = { createdAt: 'desc' }
      break
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' }
      break
  }

  const ingredientIdsArray = filters.ingredientIds
    ? filters.ingredientIds.split(',').filter(id => id.trim())
    : []

  const recipeList = await db.recipe.findMany({
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
    select: {
      id: true,
      slug: true,
      title: true,
      shortTitle: true,
      imageUrl: true,
      cookTime: true,
      calories: true,
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
    take: filters.limit,
    skip: filters.offset,
  })

  let finalRecipes = recipeList
  if (filters.sortBy === 'random') {
    finalRecipes = recipeList.sort(() => Math.random() - 0.5)
  }

  return c.json(finalRecipes)
})

// GET /recipes/:slug - Get recipe by slug
recipes.get('/:slug', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const { slug } = c.req.param()

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: { id: true, organizationsOwned: { select: { id: true } } },
  })

  if (!user?.id || !user.organizationsOwned.length || user.organizationsOwned.length > 1) {
    throw new HTTPException(404, {
      message: 'User or organization not found',
    })
  }

  const recipe = await db.recipe.findUnique({
    where: {
      slug: slug,
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
    throw new HTTPException(404, {
      message: 'Recipe not found',
    })
  }

  return c.json(recipe)
})

// POST /recipes/:slug/cookbook - Add recipe to cookbook (favorites)
recipes.post('/:slug/cookbook', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  await enforceLibraryLimit(session.user.id)

  const { slug } = c.req.param()

  const recipe = await db.recipe.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!recipe) {
    throw new HTTPException(404, {
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
      return c.json({ message: 'Recipe is already in your favorites' }, 200)
    } else {
      const restoredFavorite = await db.recipeFavorite.update({
        where: { id: existingFavorite.id },
        data: {
          deletedAt: null,
          updatedAt: new Date(),
        },
      })

      return c.json(
        {
          message: 'Recipe added to favorites',
          favorite: restoredFavorite,
        },
        200
      )
    }
  }

  await db.recipeFavorite.create({
    data: {
      recipeId: recipe.id,
      userId: session.user.id,
    },
  })

  return c.json(
    {
      message: 'Recipe added to favorites',
    },
    201
  )
})

// DELETE /recipes/:slug/cookbook/:cookbookId - Remove recipe from cookbook
recipes.delete('/:slug/cookbook/:cookbookId', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const { slug, cookbookId } = c.req.param()

  const recipe = await db.recipe.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!recipe) {
    throw new HTTPException(404, {
      message: 'Recipe not found',
    })
  }

  const existingFavorite = await db.recipeFavorite.findUnique({
    where: {
      id: cookbookId,
      recipeId_userId: {
        recipeId: recipe.id,
        userId: session.user.id,
      },
    },
  })

  if (!existingFavorite || existingFavorite.deletedAt) {
    throw new HTTPException(404, {
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

  return c.body(null, 204)
})

// DELETE /recipes/:slug/lists/:listId - Delete recipe from list
recipes.delete('/:slug/lists/:listId', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const { slug, listId } = c.req.param()

  const recipe = await db.recipe.findUnique({
    where: { slug, userId: session.user.id, deletedAt: null },
    select: { id: true },
  })

  if (!recipe) {
    throw new HTTPException(404, {
      message: 'Recipe not found',
    })
  }

  const list = await db.groceryList.findFirst({
    where: { id: listId, userId: session.user.id, deletedAt: null },
  })

  if (!list) {
    throw new HTTPException(404, {
      message: 'Grocery list not found',
    })
  }

  await db.$transaction(async tx => {
    await tx.listItem.updateMany({
      where: { listId, recipeId: recipe.id },
      data: { checked: false, notes: null, deletedAt: new Date() },
    })

    await tx.groceryList.update({
      where: { id: listId },
      data: { completed: true, deletedAt: new Date() },
    })
  })

  return c.body(null, 204)
})

// PATCH /recipes/:slug/items/:itemId - Update list item
recipes.patch('/:slug/items/:itemId', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const { slug, itemId } = c.req.param()

  const payload = await UpdateListItemRequestSchema.parseAsync(await c.req.json())

  const recipe = await db.recipe.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!recipe) {
    throw new HTTPException(404, {
      message: 'Recipe not found',
    })
  }

  const item = await db.listItem.findFirst({
    where: {
      id: itemId,
      recipeId: recipe.id,
      deletedAt: null,
      list: {
        userId: session.user.id,
      },
    },
  })

  if (!item) {
    throw new HTTPException(404, {
      message: 'List item not found',
    })
  }

  if ('clearAll' in payload) {
    await db.$transaction(async tx => {
      await tx.listItem.updateMany({
        where: { id: itemId, recipeId: recipe.id },
        data: { deletedAt: new Date() },
      })

      await tx.groceryList.update({
        where: { id: item.listId },
        data: { completed: true, deletedAt: new Date() },
      })
    })

    return c.body(null, 204)
  }

  if ('checked' in payload) {
    await db.listItem.update({
      where: { id: itemId, recipeId: recipe.id },
      data: { checked: payload.checked, updatedAt: new Date() },
    })

    return c.body(null, 204)
  }

  if ('notes' in payload) {
    await db.listItem.update({
      where: { id: itemId, recipeId: recipe.id },
      data: { notes: payload.notes, updatedAt: new Date() },
    })

    return c.body(null, 204)
  }

  await db.listItem.update({
    where: { id: itemId, recipeId: recipe.id },
    data: { deletedAt: new Date() },
  })

  return c.body(null, 204)
})

export default recipes
