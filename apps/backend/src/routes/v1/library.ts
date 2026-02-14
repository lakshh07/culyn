import { auth } from '@/lib/auth'
import db from '@/lib/prisma'
import type { UnifiedContentItem } from '@culyn/shared/schemas'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

const library = new Hono()

// GET /library - Get user's saved content (favorites) across all categories
library.get('/', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const category = c.req.query('category')

  const shouldFetchRecipes = !category || category === 'RECIPE'
  const shouldFetchPlaces = !category || category === 'PLACE'
  const shouldFetchProducts = !category || category === 'PRODUCT'

  const [recipeFavorites, placeFavorites, productFavorites] = await Promise.all([
    shouldFetchRecipes
      ? db.recipeFavorite.findMany({
          where: {
            userId: session.user.id,
            deletedAt: null,
          },
          include: {
            recipe: {
              select: {
                id: true,
                slug: true,
                title: true,
                imageUrl: true,
                cookTime: true,
                calories: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      : [],
    shouldFetchPlaces
      ? db.placeFavorite.findMany({
          where: {
            userId: session.user.id,
            deletedAt: null,
          },
          include: {
            place: {
              select: {
                id: true,
                slug: true,
                name: true,
                imageUrl: true,
                city: true,
                type: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      : [],
    shouldFetchProducts
      ? db.productFavorite.findMany({
          where: {
            userId: session.user.id,
            deletedAt: null,
          },
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                name: true,
                imageUrl: true,
                brand: true,
                price: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      : [],
  ])

  const unified: UnifiedContentItem[] = []

  for (const fav of recipeFavorites) {
    unified.push({
      id: fav.recipe.id,
      slug: fav.recipe.slug,
      category: 'RECIPE',
      title: fav.recipe.title,
      imageUrl: fav.recipe.imageUrl,
      isFavorited: true,
      createdAt: fav.createdAt.toISOString(),
      cookTime: fav.recipe.cookTime,
      calories: fav.recipe.calories,
    })
  }

  for (const fav of placeFavorites) {
    unified.push({
      id: fav.place.id,
      slug: fav.place.slug,
      category: 'PLACE',
      title: fav.place.name,
      imageUrl: fav.place.imageUrl,
      isFavorited: true,
      createdAt: fav.createdAt.toISOString(),
      city: fav.place.city,
      placeType: fav.place.type,
    })
  }

  for (const fav of productFavorites) {
    unified.push({
      id: fav.product.id,
      slug: fav.product.slug,
      category: 'PRODUCT',
      title: fav.product.name,
      imageUrl: fav.product.imageUrl,
      isFavorited: true,
      createdAt: fav.createdAt.toISOString(),
      brand: fav.product.brand,
      price: fav.product.price,
    })
  }

  // Sort by createdAt desc
  unified.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return dateB - dateA
  })

  return c.json(unified)
})

export default library
