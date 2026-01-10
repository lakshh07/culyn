import { createClient, type RedisClientType } from 'redis'

class Cache {
  private static client: RedisClientType | null = null

  private static async connect(): Promise<RedisClientType> {
    if (!Cache.client || !Cache.client.isReady) {
      Cache.client = createClient({ url: process.env.REDIS_URL })
      await Cache.client.connect()
    }

    return Cache.client
  }

  private async connect(): Promise<RedisClientType> {
    return await Cache.connect()
  }

  async get(key: string) {
    const client = await this.connect()
    return client.get(key)
  }

  async swr<T>(key: string, fetcher: () => Promise<T>, ttl: number) {
    const client = await this.connect()
    let cached = await client.get(key)

    if (!cached) {
      const fresh = await fetcher()
      cached = JSON.stringify(fresh)
      await client.setEx(key, ttl, cached)
    }

    return JSON.parse(cached) as T
  }

  async remember(key: string, data: string, ttl?: number) {
    const client = await this.connect()
    ttl ? await client.setEx(key, ttl, data) : await client.set(key, data)
  }

  async forget(key: string | string[]) {
    const client = await this.connect()
    await client.del(key)
  }

  async clean() {
    const client = await this.connect()
    await client.flushDb()
  }
}

export const cache = new Cache()
