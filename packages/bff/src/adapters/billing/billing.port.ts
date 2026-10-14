import type { BillingInterval, Subscription } from '@ia-task-manager/schemas/billing'
import type { BillingRedirect } from '@ia-task-manager/server'

export type CheckoutSessionInput = {
  userId: string
  email: string
  interval: BillingInterval
}

export interface BillingPort {
  getSubscription(userId: string): Promise<Subscription>
  createCheckoutSession(input: CheckoutSessionInput): Promise<BillingRedirect>
  createPortalSession(userId: string): Promise<BillingRedirect>
}
