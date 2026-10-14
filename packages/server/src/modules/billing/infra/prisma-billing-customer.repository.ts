import type { PrismaClient } from '../../../db/generated/prisma/client'
import type {
  BillingCustomerRecord,
  IBillingCustomerRepository,
} from '../repositories/billing-customer-repository.interface'

export class PrismaBillingCustomerRepository implements IBillingCustomerRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByUserId(userId: string): Promise<BillingCustomerRecord | null> {
    const row = await this.db.billingCustomer.findUnique({ where: { userId } })
    return row ? { userId: row.userId, stripeCustomerId: row.stripeCustomerId } : null
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<BillingCustomerRecord | null> {
    const row = await this.db.billingCustomer.findUnique({ where: { stripeCustomerId } })
    return row ? { userId: row.userId, stripeCustomerId: row.stripeCustomerId } : null
  }

  async save(userId: string, stripeCustomerId: string): Promise<void> {
    await this.db.billingCustomer.upsert({
      where: { userId },
      create: { userId, stripeCustomerId },
      update: { stripeCustomerId },
    })
  }
}
