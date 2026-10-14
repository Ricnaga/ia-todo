import type { Subscription } from '@ia-task-manager/schemas/billing'
import type { BillingRedirect } from '../../../shared/payments/payment.service.interface'
import type {
  CreateCheckoutSessionParams,
  IBillingUseCase,
} from '../use-cases/billing.use-case.interface'

export class BillingController {
  constructor(private readonly billingUseCase: IBillingUseCase) {}

  getSubscription(userId: string): Promise<Subscription> {
    return this.billingUseCase.getSubscription(userId)
  }

  createCheckoutSession(params: CreateCheckoutSessionParams): Promise<BillingRedirect> {
    return this.billingUseCase.createCheckoutSession(params)
  }

  createPortalSession(userId: string): Promise<BillingRedirect> {
    return this.billingUseCase.createPortalSession(userId)
  }

  handleWebhook(payload: string, signature: string): Promise<void> {
    return this.billingUseCase.handleWebhook(payload, signature)
  }
}
