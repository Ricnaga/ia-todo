import type {
  NormalizedBillingEvent,
  PaymentService,
} from '../../../shared/payments/payment.service.interface'
import type { IBillingCustomerRepository } from '../repositories/billing-customer-repository.interface'
import type { IWebhookEventRepository } from '../repositories/webhook-event-repository.interface'
import type { ISubscriptionRepository } from '../repositories/subscription-repository.interface'

export class HandleWebhookEventUseCase {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly subscriptions: ISubscriptionRepository,
    private readonly customers: IBillingCustomerRepository,
    private readonly webhookEvents: IWebhookEventRepository,
  ) {}

  async execute(payload: string, signature: string): Promise<void> {
    const event = this.paymentService.parseWebhookEvent(payload, signature)
    if (!event) return
    if (await this.webhookEvents.exists(event.id)) return

    await this.apply(event)
    await this.webhookEvents.register(event.id, event.kind)
  }

  private async apply(event: NormalizedBillingEvent): Promise<void> {
    if (event.kind === 'checkout.completed') {
      if (event.userId) await this.customers.save(event.userId, event.stripeCustomerId)
      return
    }

    if (event.kind === 'subscription.deleted') {
      await this.subscriptions.deleteByStripeSubscriptionId(event.stripeSubscriptionId)
      return
    }

    const userId = await this.resolveUserId(event.userId, event.stripeCustomerId)
    if (!userId) return

    await this.subscriptions.upsert({
      userId,
      stripeSubscriptionId: event.stripeSubscriptionId,
      stripeCustomerId: event.stripeCustomerId,
      priceId: event.priceId,
      status: event.status,
      currentPeriodEnd: event.currentPeriodEnd,
      cancelAtPeriodEnd: event.cancelAtPeriodEnd,
    })
  }

  private async resolveUserId(
    userId: string | null,
    stripeCustomerId: string,
  ): Promise<string | null> {
    if (userId) return userId
    const customer = await this.customers.findByStripeCustomerId(stripeCustomerId)
    return customer?.userId ?? null
  }
}
