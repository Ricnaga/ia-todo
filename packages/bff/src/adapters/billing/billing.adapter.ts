import type { BillingController } from '@ia-task-manager/server'
import type { BillingPort } from './billing.port'

export function billingAdapter(controller: BillingController): BillingPort {
  return {
    getSubscription: (userId) => controller.getSubscription(userId),
    createCheckoutSession: (input) => controller.createCheckoutSession(input),
    createPortalSession: (userId) => controller.createPortalSession(userId),
  }
}
