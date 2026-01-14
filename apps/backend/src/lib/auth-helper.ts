import { validateApiKey } from '@/lib/api-key'
import { auth } from '@/lib/auth'
import type { Context } from 'hono'

/**
 * User info extracted from authentication
 */
export type AuthUser = {
  id: string
  email: string
  name: string | null
}

/**
 * Authenticate request using either Better Auth session or API key
 * Returns user info if authenticated, null otherwise
 */
export async function authenticateRequest(c: Context): Promise<AuthUser | null> {
  // Try API key first (from Authorization header)
  const authHeader = c.req.header('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const apiKey = authHeader.substring(7)
    const result = await validateApiKey(apiKey)
    if (result) {
      return result.user
    }
  }

  // Try X-API-Key header
  const apiKeyHeader = c.req.header('X-API-Key')
  if (apiKeyHeader) {
    const result = await validateApiKey(apiKeyHeader)
    if (result) {
      return result.user
    }
  }

  // Fall back to Better Auth session
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    if (session?.user) {
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      }
    }
  } catch (error) {
    // Session validation failed
    return null
  }

  return null
}
