import { env } from '@/server/config/environment'
import { RedisCache } from '@/server/shared/cache/redis'
import type { ICache } from '@/server/shared/cache/cache.interface'

export const cache: ICache = new RedisCache(env.REDIS_URL)
