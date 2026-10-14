import type { BillingInterval, Subscription } from '@ia-task-manager/schemas/billing'
import type { BillingRedirect } from '../../../shared/payments/payment.service.interface'

export type CreateCheckoutSessionParams = {
  userId: string
  email: string
  interval: BillingInterval
}

export interface IBillingUseCase {
  getSubscription(userId: string): Promise<Subscription>
  createCheckoutSession(params: CreateCheckoutSessionParams): Promise<BillingRedirect>
  createPortalSession(userId: string): Promise<BillingRedirect>
  handleWebhook(payload: string, signature: string): Promise<void>
}
