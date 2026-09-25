import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@ia-task-manager/server/auth'

export const { POST, GET } = toNextJsHandler(auth)
