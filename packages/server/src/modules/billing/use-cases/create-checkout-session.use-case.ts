import { env } from '../../../config/environment'
import type {
  BillingRedirect,
  PaymentService,
} from '../../../shared/payments/payment.service.interface'
import type { IBillingCustomerRepository } from '../repositories/billing-customer-repository.interface'
import { BILLING_PAGE_PATH, resolvePriceId } from '../constants/billing.constants'
import type { CreateCheckoutSessionParams } from './billing.use-case.interface'

export class CreateCheckoutSessionUseCase {
  constructor(
    private readonly customers: IBillingCustomerRepository,
    private readonly paymentService: PaymentService,
  ) {}

  async execute(params: CreateCheckoutSessionParams): Promise<BillingRedirect> {
    const stripeCustomerId = await this.ensureCustomer(params.userId, params.email)
    const billingPage = `${env.BETTER_AUTH_URL}${BILLING_PAGE_PATH}`

    return this.paymentService.createCheckoutSession({
      userId: params.userId,
      stripeCustomerId,
      priceId: resolvePriceId(params.interval),
      successUrl: `${billingPage}?checkout=success`,
      cancelUrl: `${billingPage}?checkout=cancel`,
    })
  }

  private async ensureCustomer(userId: string, email: string): Promise<string> {
    const existing = await this.customers.findByUserId(userId)
    if (existing) return existing.stripeCustomerId

    const stripeCustomerId = await this.paymentService.createCustomer({ userId, email })
    await this.customers.save(userId, stripeCustomerId)
    return stripeCustomerId
  }
}
