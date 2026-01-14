import { auth } from '@/lib/auth'
import db from '@/lib/prisma'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

const cookbook = new Hono()

cookbook.get('/', async c => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const favorites = await db.recipeFavorite.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
    },
    select: {
      id: true,
      recipe: {
        select: {
          id: true,
          slug: true,
          title: true,
          shortTitle: true,
          imageUrl: true,
          sourceName: true,
          cookTime: true,
          metadata: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return c.json(favorites)
})

export default cookbook
