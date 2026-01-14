import { createApiKey } from '@/lib/api-key'
import { authenticateRequest } from '@/lib/auth-helper'
import db from '@/lib/prisma'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'

const apiKeys = new Hono()

// GET /api-keys - List all API keys for current user
apiKeys.get('/', async c => {
  const user = await authenticateRequest(c)

  if (!user) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const keys = await db.apiKey.findMany({
    where: {
      userId: user.id,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return c.json(keys)
})

// POST /api-keys - Create new API key
apiKeys.post('/', async c => {
  const user = await authenticateRequest(c)

  if (!user) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const payload = await z
    .object({
      name: z.string().min(1, 'API key name is required').max(100),
      expiresInDays: z.number().int().positive().max(365).optional(),
    })
    .parseAsync(await c.req.json())

  // Calculate expiration date if provided
  const expiresAt = payload.expiresInDays
    ? new Date(Date.now() + payload.expiresInDays * 24 * 60 * 60 * 1000)
    : undefined

  const result = await createApiKey(user.id, payload.name, expiresAt)

  return c.json(
    {
      message: 'API key created successfully',
      apiKey: result.apiKey,
      id: result.id,
      name: result.name,
      keyPrefix: result.keyPrefix,
      expiresAt: result.expiresAt,
      createdAt: result.createdAt,
    },
    201
  )
})

// DELETE /api-keys/:id - Delete (soft delete) an API key
apiKeys.delete('/:id', async c => {
  const user = await authenticateRequest(c)

  if (!user) {
    throw new HTTPException(401, {
      message: 'You are not authenticated, please login',
    })
  }

  const { id } = c.req.param()

  const apiKey = await db.apiKey.findUnique({
    where: {
      id,
      userId: user.id,
      deletedAt: null,
    },
  })

  if (!apiKey) {
    throw new HTTPException(404, {
      message: 'API key not found',
    })
  }

  await db.apiKey.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return c.json({ message: 'API key deleted successfully' })
})

export default apiKeys
