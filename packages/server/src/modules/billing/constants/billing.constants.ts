import type { BillingInterval, SubscriptionStatus } from '@ia-task-manager/schemas/billing'
import { env } from '../../../config/environment'
import { StripeNotConfiguredError } from '../../../shared/errors/app.errors'

export const BILLING_PAGE_PATH = '/planos'

const ACTIVE_STATUSES = new Set<SubscriptionStatus>(['active', 'trialing'])

export function isActiveStatus(status: SubscriptionStatus): boolean {
  return ACTIVE_STATUSES.has(status)
}

export function resolvePriceId(interval: BillingInterval): string {
  const priceId = interval === 'monthly' ? env.STRIPE_PRICE_ID_MONTHLY : env.STRIPE_PRICE_ID_YEARLY
  if (!priceId) throw new StripeNotConfiguredError()
  return priceId
}
