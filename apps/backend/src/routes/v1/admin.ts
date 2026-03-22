import { auth } from '@/lib/auth'
import { S3_CONFIG, uploadRecipeImage } from '@/lib/aws/s3-helpers'
import db from '@/lib/prisma'
import { placeImageService } from '@/lib/services/place/place-image.service'
import { productImageService } from '@/lib/services/product/product-image.service'
import { recipeImageService } from '@/lib/services/recipe/recipe-image.service'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'

const admin = new Hono()

// ─── Admin auth helper ────────────────────────────────────────────────────────

async function requireAdmin(headers: Headers) {
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw new HTTPException(401, { message: 'You are not authenticated, please login' })
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } })

  if (!user || !user.isAdmin) {
    throw new HTTPException(403, { message: 'Admin access required' })
  }

  return { session, user }
}

// ─── Listing endpoints ────────────────────────────────────────────────────────

// GET /admin/recipes?page=&limit=20&q=
admin.get('/recipes', async c => {
  await requireAdmin(c.req.raw.headers)

  const page = Math.max(1, Number(c.req.query('page') ?? 1))
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') ?? 20)))
  const q = c.req.query('q')?.trim()
  const skip = (page - 1) * limit

  const where = {
    deletedAt: null,
    ...(q && {
      OR: [
        { title: { contains: q, mode: 'insensitive' as const } },
        { shortTitle: { contains: q, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [items, total] = await Promise.all([
    db.recipe.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        shortTitle: true,
        imageUrl: true,
        cookTime: true,
        difficulty: true,
        isPublic: true,
        createdAt: true,
        calories: true,
        servings: true,
      },
    }),
    db.recipe.count({ where }),
  ])

  return c.json({ items, total, page, limit })
})

// GET /admin/places?page=&limit=20&q=
admin.get('/places', async c => {
  await requireAdmin(c.req.raw.headers)

  const page = Math.max(1, Number(c.req.query('page') ?? 1))
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') ?? 20)))
  const q = c.req.query('q')?.trim()
  const skip = (page - 1) * limit

  const where = {
    deletedAt: null,
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { city: { contains: q, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [items, total] = await Promise.all([
    db.place.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        name: true,
        shortName: true,
        imageUrl: true,
        type: true,
        city: true,
        cuisine: true,
        isPublic: true,
        createdAt: true,
        priceRange: true,
        rating: true,
      },
    }),
    db.place.count({ where }),
  ])

  return c.json({ items, total, page, limit })
})

// GET /admin/products?page=&limit=20&q=
admin.get('/products', async c => {
  await requireAdmin(c.req.raw.headers)

  const page = Math.max(1, Number(c.req.query('page') ?? 1))
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') ?? 20)))
  const q = c.req.query('q')?.trim()
  const skip = (page - 1) * limit

  const where = {
    deletedAt: null,
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { brand: { contains: q, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        name: true,
        shortName: true,
        imageUrl: true,
        category: true,
        brand: true,
        price: true,
        currency: true,
        isPublic: true,
        createdAt: true,
      },
    }),
    db.product.count({ where }),
  ])

  return c.json({ items, total, page, limit })
})

// ─── PATCH update endpoints ───────────────────────────────────────────────────

const PatchRecipeSchema = z.object({
  title: z.string().optional(),
  shortTitle: z.string().optional(),
  description: z.string().optional(),
  tagline: z.string().optional(),
  notes: z.string().optional(),
  cookTime: z.number().int().positive().optional(),
  servings: z.number().int().positive().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  calories: z.number().int().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
  isPublic: z.boolean().optional(),
  cookingSteps: z.any().optional(),
  ingredients: z.any().optional(),
})

const PatchPlaceSchema = z.object({
  name: z.string().optional(),
  shortName: z.string().optional(),
  description: z.string().optional(),
  type: z
    .enum([
      'RESTAURANT',
      'CAFE',
      'BAR',
      'BAKERY',
      'FOOD_TRUCK',
      'MARKET',
      'GROCERY_STORE',
      'SPECIALTY_SHOP',
      'OTHER',
    ])
    .optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  phoneNumber: z.string().optional(),
  website: z.string().optional(),
  priceRange: z.string().optional(),
  cuisine: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().optional(),
  hours: z.any().optional(),
})

const PatchProductSchema = z.object({
  name: z.string().optional(),
  shortName: z.string().optional(),
  description: z.string().optional(),
  category: z
    .enum([
      'BEAUTY',
      'TECH',
      'FASHION',
      'KITCHEN',
      'HOME',
      'HEALTH',
      'SPORTS',
      'BOOKS',
      'TOYS',
      'OTHER',
    ])
    .optional(),
  brand: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  purchaseUrl: z.string().optional(),
  affiliateUrl: z.string().optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().optional(),
  specifications: z.any().optional(),
  features: z.any().optional(),
})

// PATCH /admin/recipes/:slug
admin.patch('/recipes/:slug', async c => {
  await requireAdmin(c.req.raw.headers)

  const { slug } = c.req.param()
  const body = await c.req.json()
  const data = PatchRecipeSchema.parse(body)

  const recipe = await db.recipe.findUnique({ where: { slug, deletedAt: null } })
  if (!recipe) throw new HTTPException(404, { message: 'Recipe not found' })

  const updated = await db.recipe.update({ where: { slug }, data })
  return c.json(updated)
})

// PATCH /admin/places/:slug
admin.patch('/places/:slug', async c => {
  await requireAdmin(c.req.raw.headers)

  const { slug } = c.req.param()
  const body = await c.req.json()
  const data = PatchPlaceSchema.parse(body)

  const place = await db.place.findUnique({ where: { slug, deletedAt: null } })
  if (!place) throw new HTTPException(404, { message: 'Place not found' })

  const updated = await db.place.update({ where: { slug }, data })
  return c.json(updated)
})

// PATCH /admin/products/:slug
admin.patch('/products/:slug', async c => {
  await requireAdmin(c.req.raw.headers)

  const { slug } = c.req.param()
  const body = await c.req.json()
  const data = PatchProductSchema.parse(body)

  const product = await db.product.findUnique({ where: { slug, deletedAt: null } })
  if (!product) throw new HTTPException(404, { message: 'Product not found' })

  const updated = await db.product.update({ where: { slug }, data })
  return c.json(updated)
})

// ─── Image regeneration endpoints ────────────────────────────────────────────

// POST /admin/recipes/:slug/image/regenerate
admin.post('/recipes/:slug/image/regenerate', async c => {
  const { user } = await requireAdmin(c.req.raw.headers)

  const { slug } = c.req.param()

  const recipe = await db.recipe.findUnique({ where: { slug, deletedAt: null } })
  if (!recipe) throw new HTTPException(404, { message: 'Recipe not found' })

  // Build a minimal object — the service only reads .title and .ingredients[].name
  const recipeInput = {
    title: recipe.title ?? slug,
    ingredients: Array.isArray(recipe.ingredients)
      ? (recipe.ingredients as { name: string; quantity: string }[])
      : [],
  }

  const buffer = await recipeImageService.generateRecipeImage({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recipe: recipeInput as any,
    userId: user.id,
    recipeId: recipe.id,
  })

  const { url: imageUrl } = await uploadRecipeImage(
    buffer,
    recipe.id,
    S3_CONFIG.FOLDERS.RECIPE_IMAGES,
    'png'
  )

  const updated = await db.recipe.update({ where: { slug }, data: { imageUrl } })

  return c.json({ imageUrl: updated.imageUrl })
})

// POST /admin/places/:slug/image/regenerate
admin.post('/places/:slug/image/regenerate', async c => {
  const { user } = await requireAdmin(c.req.raw.headers)

  const { slug } = c.req.param()

  const place = await db.place.findUnique({ where: { slug, deletedAt: null } })
  if (!place) throw new HTTPException(404, { message: 'Place not found' })

  const buffer = await placeImageService.generatePlaceImage({
    place: {
      name: place.name ?? slug,
      type: place.type,
      cuisine: place.cuisine,
      city: place.city,
    },
    userId: user.id,
    placeId: place.id,
  })

  const { url: imageUrl } = await uploadRecipeImage(
    buffer,
    place.id,
    S3_CONFIG.FOLDERS.PLACE_IMAGES,
    'jpg'
  )

  const updated = await db.place.update({ where: { slug }, data: { imageUrl } })

  return c.json({ imageUrl: updated.imageUrl })
})

// POST /admin/products/:slug/image/regenerate
admin.post('/products/:slug/image/regenerate', async c => {
  const { user } = await requireAdmin(c.req.raw.headers)

  const { slug } = c.req.param()

  const product = await db.product.findUnique({ where: { slug, deletedAt: null } })
  if (!product) throw new HTTPException(404, { message: 'Product not found' })

  const productInput = {
    name: product.name ?? slug,
    category: product.category,
    brand: product.brand ?? undefined,
    description: product.description ?? undefined,
    features: Array.isArray(product.features) ? (product.features as string[]) : undefined,
  }

  const buffer = await productImageService.generateProductImage({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    product: productInput as any,
    userId: user.id,
    productId: product.id,
  })

  const { url: imageUrl } = await uploadRecipeImage(
    buffer,
    product.id,
    S3_CONFIG.FOLDERS.PRODUCT_IMAGES,
    'jpg'
  )

  const updated = await db.product.update({ where: { slug }, data: { imageUrl } })

  return c.json({ imageUrl: updated.imageUrl })
})

// Keep old route path as alias for backward compatibility
admin.post('/recipes/:slug/image', async c => {
  return c.redirect(`/v1/admin/recipes/${c.req.param('slug')}/image/regenerate`, 308)
})

export default admin
