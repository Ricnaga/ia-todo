import { createBillingWebhookHandler } from '@ia-task-manager/bff'

export const runtime = 'nodejs'

const handleWebhook = createBillingWebhookHandler()

export function POST(request: Request) {
  return handleWebhook(request)
}
