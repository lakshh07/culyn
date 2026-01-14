import { Context, Next } from 'hono'

/**
 * Simple request logger middleware
 */
export async function logger(c: Context, next: Next) {
  const start = Date.now()
  await next()
  const end = Date.now()

  console.log(`${c.req.method} ${c.req.path} - ${c.res.status} (${end - start}ms)`)
}
