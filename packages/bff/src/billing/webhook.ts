import { billingController } from '@ia-task-manager/server/containers'

export function createBillingWebhookHandler() {
  return async (request: Request): Promise<Response> => {
    const signature = request.headers.get('stripe-signature')
    if (!signature) {
      return new Response('Assinatura ausente.', { status: 400 })
    }

    const payload = await request.text()

    try {
      await billingController.handleWebhook(payload, signature)
    } catch {
      return new Response('Falha ao processar o webhook.', { status: 400 })
    }

    return new Response(null, { status: 200 })
  }
}
