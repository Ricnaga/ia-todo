import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/server/modules/auth/infra/better-auth'

export const { POST, GET } = toNextJsHandler(auth)
