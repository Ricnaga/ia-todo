import type { Subscription } from '@ia-task-manager/schemas/billing'
import type { ISubscriptionRepository } from '../repositories/subscription-repository.interface'
import { toSubscription } from '../mappers/subscription.mapper'

export class GetSubscriptionUseCase {
  constructor(private readonly subscriptions: ISubscriptionRepository) {}

  async execute(userId: string): Promise<Subscription> {
    const record = await this.subscriptions.findByUserId(userId)
    return toSubscription(record)
  }
}
