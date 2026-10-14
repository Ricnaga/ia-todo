import { env } from '../../../config/environment'
import type {
  BillingRedirect,
  PaymentService,
} from '../../../shared/payments/payment.service.interface'
import { SubscriptionNotFoundError } from '../../../shared/errors/app.errors'
import type { IBillingCustomerRepository } from '../repositories/billing-customer-repository.interface'
import { BILLING_PAGE_PATH } from '../constants/billing.constants'

export class CreatePortalSessionUseCase {
  constructor(
    private readonly customers: IBillingCustomerRepository,
    private readonly paymentService: PaymentService,
  ) {}

  async execute(userId: string): Promise<BillingRedirect> {
    const customer = await this.customers.findByUserId(userId)
    if (!customer) throw new SubscriptionNotFoundError()

    return this.paymentService.createPortalSession({
      stripeCustomerId: customer.stripeCustomerId,
      returnUrl: `${env.BETTER_AUTH_URL}${BILLING_PAGE_PATH}`,
    })
  }
}
