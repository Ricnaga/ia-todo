import { createBillingWebhookHandler } from '@ia-task-manager/bff'
import type { RequestHandler } from './$types'

const handleWebhook = createBillingWebhookHandler()

export const POST: RequestHandler = ({ request }) => handleWebhook(request)
