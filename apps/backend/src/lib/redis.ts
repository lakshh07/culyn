import { createClient } from 'redis'

const redis = createClient({
  url: process.env.REDIS_URL ?? 'redis://localhost:6379',
})

redis.on('error', err => console.error('[Redis] Client error:', err))

let connectPromise: Promise<unknown> | null = null

export async function getRedis() {
  if (!connectPromise) {
    connectPromise = redis.connect()
  }
  await connectPromise
  return redis
}

export default redis
