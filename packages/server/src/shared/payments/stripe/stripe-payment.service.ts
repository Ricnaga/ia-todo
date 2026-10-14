import Stripe from 'stripe'
import { env } from '../../../config/environment'
import { StripeNotConfiguredError } from '../../errors/app.errors'
import type { SubscriptionStatus } from '@ia-task-manager/schemas/billing'
import type {
  BillingRedirect,
  CreateCheckoutSessionParams,
  CreateCustomerParams,
  CreatePortalSessionParams,
  NormalizedBillingEvent,
  PaymentService,
} from '../payment.service.interface'

function metadataUserId(metadata: Stripe.Metadata | null): string | null {
  const userId = metadata?.userId
  return typeof userId === 'string' && userId.length > 0 ? userId : null
}

function resolveId(value: { id: string } | string | null | undefined): string | null {
  if (!value) return null
  return typeof value === 'string' ? value : value.id
}

function toDate(seconds: number | undefined): Date | null {
  return typeof seconds === 'number' ? new Date(seconds * 1000) : null
}

function currentPeriodEnd(subscription: Stripe.Subscription): Date | null {
  return toDate(subscription.items.data[0]?.current_period_end)
}

export class StripePaymentService implements PaymentService {
  private readonly stripe: Stripe | null

  constructor() {
    this.stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null
  }

  private client(): Stripe {
    if (!this.stripe) throw new StripeNotConfiguredError()
    return this.stripe
  }

  async createCustomer(params: CreateCustomerParams): Promise<string> {
    const customer = await this.client().customers.create({
      email: params.email,
      metadata: { userId: params.userId },
    })
    return customer.id
  }

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<BillingRedirect> {
    const session = await this.client().checkout.sessions.create({
      mode: 'subscription',
      customer: params.stripeCustomerId,
      client_reference_id: params.userId,
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      subscription_data: { metadata: { userId: params.userId } },
    })
    if (!session.url) throw new StripeNotConfiguredError()
    return { url: session.url }
  }

  async createPortalSession(params: CreatePortalSessionParams): Promise<BillingRedirect> {
    const session = await this.client().billingPortal.sessions.create({
      customer: params.stripeCustomerId,
      return_url: params.returnUrl,
    })
    return { url: session.url }
  }

  parseWebhookEvent(payload: string, signature: string): NormalizedBillingEvent | null {
    if (!env.STRIPE_WEBHOOK_SECRET) throw new StripeNotConfiguredError()
    const event = this.client().webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const stripeCustomerId = resolveId(session.customer)
      if (!stripeCustomerId) return null
      return {
        id: event.id,
        kind: 'checkout.completed',
        userId: session.client_reference_id ?? metadataUserId(session.metadata),
        stripeCustomerId,
      }
    }

    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated'
    ) {
      const subscription = event.data.object
      const stripeCustomerId = resolveId(subscription.customer)
      if (!stripeCustomerId) return null
      return {
        id: event.id,
        kind: 'subscription.changed',
        userId: metadataUserId(subscription.metadata),
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        priceId: subscription.items.data[0]?.price.id ?? null,
        status: subscription.status as SubscriptionStatus,
        currentPeriodEnd: currentPeriodEnd(subscription),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      const stripeCustomerId = resolveId(subscription.customer)
      if (!stripeCustomerId) return null
      return {
        id: event.id,
        kind: 'subscription.deleted',
        userId: metadataUserId(subscription.metadata),
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
      }
    }

    return null
  }
}
