import { auth } from '@/lib/auth'
import db from '@/lib/prisma'
import { enforceLibraryLimit } from '@/lib/subscription'
import { ListProductsQuerySchema } from '@culyn/shared/schemas'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

const products = new Hono()

// GET /products - List products with filters
products.get('/', async c => {
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

  const filters = await ListProductsQuerySchema.parseAsync(queryParams)

  let orderBy: any = { createdAt: 'desc' }

  switch (filters.sortBy) {
    case 'oldest':
      orderBy = { createdAt: 'asc' }
      break
    case 'popular':
      orderBy = [{ ProductFavorite: { _count: 'desc' } }, { createdAt: 'desc' }]
      break
    case 'price_asc':
      orderBy = { price: 'asc' }
      break
    case 'price_desc':
      orderBy = { price: 'desc' }
      break
    case 'random':
      orderBy = { createdAt: 'desc' }
      break
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' }
      break
  }

  const productList = await db.product.findMany({
    where: {
      deletedAt: null,
      userId: session.user.id,
      ...(filters.category && { category: filters.category }),
      ...(filters.brand && {
        brand: {
          contains: filters.brand,
          mode: 'insensitive' as const,
        },
      }),
      ...(filters.priceMin !== undefined && {
        price: { gte: filters.priceMin },
      }),
      ...(filters.priceMax !== undefined && {
        price: { lte: filters.priceMax },
      }),
      ...(filters.q && {
        OR: [
          { name: { contains: filters.q, mode: 'insensitive' as const } },
          { shortName: { contains: filters.q, mode: 'insensitive' as const } },
          { brand: { contains: filters.q, mode: 'insensitive' as const } },
          { description: { contains: filters.q, mode: 'insensitive' as const } },
        ],
      }),
    },
    select: {
      id: true,
      slug: true,
      name: true,
      shortName: true,
      category: true,
      brand: true,
      price: true,
      currency: true,
      imageUrl: true,
      tags: {
        where: { deletedAt: null },
        include: {
          tag: {
            select: { id: true, name: true, type: true },
          },
        },
      },
      ProductFavorite: {
        where: { deletedAt: null },
        select: { id: true },
      },
      _count: {
        select: { ProductFavorite: true },
      },
    },
    orderBy,
    take: filters.limit,
    skip: filters.offset,
  })

  let finalProducts = productList
  if (filters.sortBy === 'random') {
    finalProducts = productList.sort(() => Math.random() - 0.5)
  }

  return c.json(finalProducts)
})

// GET /products/:slug - Get product by slug
products.get('/:slug', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const { slug } = c.req.param()

  const product = await db.product.findUnique({
    where: {
      slug,
      userId: session.user.id,
    },
    include: {
      ProductFavorite: {
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

  if (!product) {
    throw new HTTPException(404, { message: 'Product not found' })
  }

  return c.json(product)
})

// POST /products/:slug/favorite - Add product to favorites
products.post('/:slug/favorite', async c => {
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

  const product = await db.product.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!product) {
    throw new HTTPException(404, { message: 'Product not found' })
  }

  const existingFavorite = await db.productFavorite.findUnique({
    where: {
      productId_userId: {
        productId: product.id,
        userId: session.user.id,
      },
    },
  })

  if (existingFavorite) {
    if (!existingFavorite.deletedAt) {
      return c.json({ message: 'Product is already in your favorites' }, 200)
    } else {
      const restoredFavorite = await db.productFavorite.update({
        where: { id: existingFavorite.id },
        data: { deletedAt: null, updatedAt: new Date() },
      })
      return c.json({ message: 'Product added to favorites', favorite: restoredFavorite }, 200)
    }
  }

  await db.productFavorite.create({
    data: {
      productId: product.id,
      userId: session.user.id,
    },
  })

  return c.json({ message: 'Product added to favorites' }, 201)
})

// DELETE /products/:slug/favorite/:favoriteId - Remove product from favorites
products.delete('/:slug/favorite/:favoriteId', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const { slug, favoriteId } = c.req.param()

  const product = await db.product.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!product) {
    throw new HTTPException(404, { message: 'Product not found' })
  }

  const existingFavorite = await db.productFavorite.findUnique({
    where: {
      id: favoriteId,
      productId_userId: {
        productId: product.id,
        userId: session.user.id,
      },
    },
  })

  if (!existingFavorite || existingFavorite.deletedAt) {
    throw new HTTPException(404, { message: 'Product is not in your favorites' })
  }

  await db.productFavorite.update({
    where: { id: existingFavorite.id },
    data: { deletedAt: new Date(), updatedAt: new Date() },
  })

  return c.body(null, 204)
})

export default products
