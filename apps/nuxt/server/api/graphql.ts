import { sendWebResponse, toWebRequest } from 'h3'
import { yoga } from '../utils/graphql'

export default defineEventHandler(async (event) => {
  return sendWebResponse(event, await yoga(toWebRequest(event)))
})
