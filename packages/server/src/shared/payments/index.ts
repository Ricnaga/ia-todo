import { StripePaymentService } from './stripe'
import type { PaymentService } from './payment.service.interface'

export const paymentService: PaymentService = new StripePaymentService()

export type {
  PaymentService,
  CreateCheckoutSessionParams,
  CreateCustomerParams,
  CreatePortalSessionParams,
  BillingRedirect,
  NormalizedBillingEvent,
} from './payment.service.interface'
