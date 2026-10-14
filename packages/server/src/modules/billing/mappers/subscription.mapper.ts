import type { Subscription } from '@ia-task-manager/schemas/billing'
import type { SubscriptionRecord } from '../repositories/subscription-repository.interface'
import { isActiveStatus } from '../constants/billing.constants'

export function toSubscription(record: SubscriptionRecord | null): Subscription {
  if (!record || !isActiveStatus(record.status)) {
    return {
      plan: 'free',
      status: record?.status ?? null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: record?.cancelAtPeriodEnd ?? false,
    }
  }

  return {
    plan: 'pro',
    status: record.status,
    currentPeriodEnd: record.currentPeriodEnd,
    cancelAtPeriodEnd: record.cancelAtPeriodEnd,
  }
}
