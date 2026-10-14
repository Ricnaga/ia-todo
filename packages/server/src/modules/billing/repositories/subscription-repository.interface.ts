import type { SubscriptionStatus } from '@ia-task-manager/schemas/billing'

export type SubscriptionRecord = {
  userId: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  priceId: string | null
  status: SubscriptionStatus
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
}

export interface ISubscriptionRepository {
  findByUserId(userId: string): Promise<SubscriptionRecord | null>
  upsert(record: SubscriptionRecord): Promise<void>
  deleteByStripeSubscriptionId(stripeSubscriptionId: string): Promise<void>
}
