import db from '@/lib/prisma'
import { createHash, randomBytes } from 'crypto'

/**
 * Generate a new API key
 * Format: culyn_<random_string>
 */
export function generateApiKey(): string {
  const randomString = randomBytes(32).toString('hex')
  return `culyn_${randomString}`
}

/**
 * Hash an API key for storage
 */
export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex')
}

/**
 * Extract prefix from API key for identification
 */
export function getKeyPrefix(apiKey: string): string {
  return apiKey.substring(0, 12) // culyn_ + first 6 chars
}

/**
 * Validate and get user from API key
 */
export async function validateApiKey(apiKey: string) {
  if (!apiKey || !apiKey.startsWith('culyn_')) {
    return null
  }

  const keyHash = hashApiKey(apiKey)

  const apiKeyRecord = await db.apiKey.findUnique({
    where: {
      keyHash,
      deletedAt: null,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          deletedAt: true,
        },
      },
    },
  })

  if (!apiKeyRecord) {
    return null
  }

  // Check if key is expired
  if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
    return null
  }

  // Check if user is deleted
  if (apiKeyRecord.user.deletedAt) {
    return null
  }

  // Update last used timestamp (fire and forget)
  db.apiKey
    .update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {
      // Ignore errors in background update
    })

  return {
    apiKeyId: apiKeyRecord.id,
    user: apiKeyRecord.user,
  }
}

/**
 * Create a new API key for a user
 */
export async function createApiKey(userId: string, name: string, expiresAt?: Date) {
  const apiKey = generateApiKey()
  const keyHash = hashApiKey(apiKey)
  const keyPrefix = getKeyPrefix(apiKey)

  const apiKeyRecord = await db.apiKey.create({
    data: {
      name,
      keyHash,
      keyPrefix,
      userId,
      expiresAt,
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
      expiresAt: true,
    },
  })

  return {
    ...apiKeyRecord,
    apiKey, // Return the plain API key ONLY on creation
  }
}
