import { prisma } from '../../db/prisma'
import { paymentService } from '../payments'
import { PrismaSubscriptionRepository } from '../../modules/billing/infra/prisma-subscription.repository'
import { PrismaBillingCustomerRepository } from '../../modules/billing/infra/prisma-billing-customer.repository'
import { PrismaWebhookEventRepository } from '../../modules/billing/infra/prisma-webhook-event.repository'
import { SubscriptionEntitlementsService } from '../../modules/billing/infra/subscription-entitlements.service'
import { GetSubscriptionUseCase } from '../../modules/billing/use-cases/get-subscription.use-case'
import { CreateCheckoutSessionUseCase } from '../../modules/billing/use-cases/create-checkout-session.use-case'
import { CreatePortalSessionUseCase } from '../../modules/billing/use-cases/create-portal-session.use-case'
import { HandleWebhookEventUseCase } from '../../modules/billing/use-cases/handle-webhook-event.use-case'
import { BillingController } from '../../modules/billing/controllers/billing.controller'
import type { IBillingUseCase } from '../../modules/billing/use-cases/billing.use-case.interface'
import type { EntitlementsService } from '../entitlements/entitlements.interface'

export const subscriptionRepository = new PrismaSubscriptionRepository(prisma)

const billingCustomerRepository = new PrismaBillingCustomerRepository(prisma)
const webhookEventRepository = new PrismaWebhookEventRepository(prisma)

const getSubscription = new GetSubscriptionUseCase(subscriptionRepository)
const createCheckoutSession = new CreateCheckoutSessionUseCase(
  billingCustomerRepository,
  paymentService,
)
const createPortalSession = new CreatePortalSessionUseCase(
  billingCustomerRepository,
  paymentService,
)
const handleWebhookEvent = new HandleWebhookEventUseCase(
  paymentService,
  subscriptionRepository,
  billingCustomerRepository,
  webhookEventRepository,
)

const billingUseCase: IBillingUseCase = {
  getSubscription: (userId) => getSubscription.execute(userId),
  createCheckoutSession: (params) => createCheckoutSession.execute(params),
  createPortalSession: (userId) => createPortalSession.execute(userId),
  handleWebhook: (payload, signature) => handleWebhookEvent.execute(payload, signature),
}

export const billingController = new BillingController(billingUseCase)

export const entitlementsService: EntitlementsService = new SubscriptionEntitlementsService(
  subscriptionRepository,
)
