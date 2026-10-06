import { sendWebResponse, toWebRequest } from 'h3'
import { auth } from '@ia-task-manager/server/auth'

export default defineEventHandler(async (event) =>
  sendWebResponse(event, await auth.handler(toWebRequest(event))),
)
