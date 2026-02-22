import { auth } from '@/lib/auth'
import db from '@/lib/prisma'
import { ListPlacesQuerySchema } from '@culyn/shared/schemas'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

const places = new Hono()

// GET /places - List places with filters
places.get('/', async c => {
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

  const filters = await ListPlacesQuerySchema.parseAsync(queryParams)

  let orderBy: any = { createdAt: 'desc' }

  switch (filters.sortBy) {
    case 'oldest':
      orderBy = { createdAt: 'asc' }
      break
    case 'popular':
      orderBy = [{ PlaceFavorite: { _count: 'desc' } }, { createdAt: 'desc' }]
      break
    case 'random':
      orderBy = { createdAt: 'desc' }
      break
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' }
      break
  }

  const placeList = await db.place.findMany({
    where: {
      deletedAt: null,
      userId: session.user.id,
      ...(filters.tagId && {
        tags: {
          some: {
            tagId: filters.tagId,
            deletedAt: null,
          },
        },
      }),
      ...(filters.type && { type: filters.type }),
      ...(filters.city && {
        city: {
          contains: filters.city,
          mode: 'insensitive' as const,
        },
      }),
      ...(filters.q && {
        OR: [
          { name: { contains: filters.q, mode: 'insensitive' as const } },
          { shortName: { contains: filters.q, mode: 'insensitive' as const } },
          { cuisine: { contains: filters.q, mode: 'insensitive' as const } },
          { city: { contains: filters.q, mode: 'insensitive' as const } },
        ],
      }),
    },
    select: {
      id: true,
      slug: true,
      name: true,
      shortName: true,
      type: true,
      city: true,
      imageUrl: true,
      cuisine: true,
      priceRange: true,
      rating: true,
      latitude: true,
      longitude: true,
      tags: {
        where: { deletedAt: null },
        include: {
          tag: {
            select: { id: true, name: true, type: true },
          },
        },
      },
      PlaceFavorite: {
        where: { deletedAt: null },
        select: { id: true },
      },
      _count: {
        select: { PlaceFavorite: true },
      },
    },
    orderBy,
    take: filters.limit,
    skip: filters.offset,
  })

  let finalPlaces = placeList
  if (filters.sortBy === 'random') {
    finalPlaces = placeList.sort(() => Math.random() - 0.5)
  }

  return c.json(finalPlaces)
})

// GET /places/:slug - Get place by slug
places.get('/:slug', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const { slug } = c.req.param()

  const place = await db.place.findUnique({
    where: {
      slug,
      userId: session.user.id,
    },
    include: {
      PlaceFavorite: {
        where: { deletedAt: null },
        select: { id: true },
      },
      tags: {
        where: { deletedAt: null },
        include: {
          tag: {
            select: { id: true, name: true, type: true },
          },
        },
      },
    },
  })

  if (!place) {
    throw new HTTPException(404, {
      message: 'Place not found',
    })
  }

  return c.json(place)
})

// POST /places/:slug/favorite - Add place to favorites
places.post('/:slug/favorite', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const { slug } = c.req.param()

  const place = await db.place.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!place) {
    throw new HTTPException(404, { message: 'Place not found' })
  }

  const existingFavorite = await db.placeFavorite.findUnique({
    where: {
      placeId_userId: {
        placeId: place.id,
        userId: session.user.id,
      },
    },
  })

  if (existingFavorite) {
    if (!existingFavorite.deletedAt) {
      return c.json({ message: 'Place is already in your favorites' }, 200)
    } else {
      const restoredFavorite = await db.placeFavorite.update({
        where: { id: existingFavorite.id },
        data: { deletedAt: null, updatedAt: new Date() },
      })
      return c.json({ message: 'Place added to favorites', favorite: restoredFavorite }, 200)
    }
  }

  await db.placeFavorite.create({
    data: {
      placeId: place.id,
      userId: session.user.id,
    },
  })

  return c.json({ message: 'Place added to favorites' }, 201)
})

// DELETE /places/:slug/favorite/:favoriteId - Remove place from favorites
places.delete('/:slug/favorite/:favoriteId', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const { slug, favoriteId } = c.req.param()

  const place = await db.place.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!place) {
    throw new HTTPException(404, { message: 'Place not found' })
  }

  const existingFavorite = await db.placeFavorite.findUnique({
    where: {
      id: favoriteId,
      placeId_userId: {
        placeId: place.id,
        userId: session.user.id,
      },
    },
  })

  if (!existingFavorite || existingFavorite.deletedAt) {
    throw new HTTPException(404, { message: 'Place is not in your favorites' })
  }

  await db.placeFavorite.update({
    where: { id: existingFavorite.id },
    data: { deletedAt: new Date(), updatedAt: new Date() },
  })

  return c.body(null, 204)
})

export default places
