import { createClient, type RedisClientType } from 'redis'
import type { ICache } from '@/server/shared/cache/cache.interface'

const DEFAULT_TTL_SECONDS = 300

export class RedisCache implements ICache {
  private client: RedisClientType | null = null
  private connecting: Promise<RedisClientType> | null = null

  constructor(private readonly url: string) {}

  private connectLazily(): Promise<RedisClientType> {
    if (this.client) return Promise.resolve(this.client)
    if (!this.connecting) {
      this.connecting = createClient({
        url: this.url,
        socket: { connectTimeout: 2000, reconnectStrategy: false },
      })
        .on('error', (error) => {
          console.error('[redis] erro de conexão:', error.message)
          this.client = null
        })
        .connect()
        .then((client) => {
          this.client = client
          return client
        })
        .catch((error) => {
          console.error('[redis] não foi possível conectar:', error.message)
          this.connecting = null
          return null as unknown as RedisClientType
        })
    }
    return this.connecting
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await (await this.connectLazily()).get(key)
      if (!raw) return null
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<void> {
    try {
      await (await this.connectLazily()).set(key, JSON.stringify(value), { EX: ttlSeconds })
    } catch {
      // cache indisponível não deve derrubar a consulta
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await (await this.connectLazily()).del(key)
    } catch {
      // cache indisponível não deve derrubar a mutação
    }
  }
}
