import { sendWebResponse, toWebRequest } from 'h3'
import { billingWebhook } from '../../utils/billing'

export default defineEventHandler(async (event) => {
  return sendWebResponse(event, await billingWebhook(toWebRequest(event)))
})
