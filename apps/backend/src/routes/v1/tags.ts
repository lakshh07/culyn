import { authenticateRequest } from '@/lib/auth-helper'
import db from '@/lib/prisma'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

const tags = new Hono()

tags.get('/', async c => {
  const user = await authenticateRequest(c)

  if (!user) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const tagList = await db.tag.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
      type: true,
    },
  })

  return c.json(tagList)
})

export default tags
