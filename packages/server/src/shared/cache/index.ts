import { env } from '../../config/environment'
import { RedisCache } from './redis'
import type { ICache } from './cache.interface'

export const cache: ICache = new RedisCache(env.REDIS_URL)
