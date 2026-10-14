import type { SubscriptionStatus } from '@ia-task-manager/schemas/billing'

export type CreateCheckoutSessionParams = {
  userId: string
  stripeCustomerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
}

export type CreateCustomerParams = {
  userId: string
  email: string
}

export type CreatePortalSessionParams = {
  stripeCustomerId: string
  returnUrl: string
}

export type BillingRedirect = {
  url: string
}

export type CheckoutCompletedEvent = {
  id: string
  kind: 'checkout.completed'
  userId: string | null
  stripeCustomerId: string
}

export type SubscriptionChangedEvent = {
  id: string
  kind: 'subscription.changed'
  userId: string | null
  stripeCustomerId: string
  stripeSubscriptionId: string
  priceId: string | null
  status: SubscriptionStatus
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
}

export type SubscriptionDeletedEvent = {
  id: string
  kind: 'subscription.deleted'
  userId: string | null
  stripeCustomerId: string
  stripeSubscriptionId: string
}

export type NormalizedBillingEvent =
  CheckoutCompletedEvent | SubscriptionChangedEvent | SubscriptionDeletedEvent

export interface PaymentService {
  createCustomer(params: CreateCustomerParams): Promise<string>
  createCheckoutSession(params: CreateCheckoutSessionParams): Promise<BillingRedirect>
  createPortalSession(params: CreatePortalSessionParams): Promise<BillingRedirect>
  parseWebhookEvent(payload: string, signature: string): NormalizedBillingEvent | null
}
