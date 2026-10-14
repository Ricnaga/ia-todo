import type { EntitlementsService } from '../../../shared/entitlements/entitlements.interface'
import type { ISubscriptionRepository } from '../repositories/subscription-repository.interface'
import { isActiveStatus } from '../constants/billing.constants'

export class SubscriptionEntitlementsService implements EntitlementsService {
  constructor(private readonly subscriptions: ISubscriptionRepository) {}

  async hasAiAccess(userId: string): Promise<boolean> {
    const record = await this.subscriptions.findByUserId(userId)
    return record !== null && isActiveStatus(record.status)
  }
}
