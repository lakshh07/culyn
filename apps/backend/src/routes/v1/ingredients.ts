import { auth } from '@/lib/auth'
import db from '@/lib/prisma'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

const ingredients = new Hono()

ingredients.get('/', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const ingredientList = await db.ingredient.findMany({
    where: {
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return c.json(ingredientList)
})

export default ingredients
