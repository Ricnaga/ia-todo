import { Prisma, type PrismaClient } from '../../../db/generated/prisma/client'
import type { SubscriptionStatus } from '@ia-task-manager/schemas/billing'
import type {
  ISubscriptionRepository,
  SubscriptionRecord,
} from '../repositories/subscription-repository.interface'

type SubscriptionRow = Prisma.SubscriptionGetPayload<object>

function toRecord(row: SubscriptionRow): SubscriptionRecord {
  return {
    userId: row.userId,
    stripeSubscriptionId: row.stripeSubscriptionId,
    stripeCustomerId: row.stripeCustomerId,
    priceId: row.priceId,
    status: row.status as SubscriptionStatus,
    currentPeriodEnd: row.currentPeriodEnd,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
  }
}

export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByUserId(userId: string): Promise<SubscriptionRecord | null> {
    const row = await this.db.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return row ? toRecord(row) : null
  }

  async upsert(record: SubscriptionRecord): Promise<void> {
    await this.db.subscription.upsert({
      where: { stripeSubscriptionId: record.stripeSubscriptionId },
      create: {
        userId: record.userId,
        stripeSubscriptionId: record.stripeSubscriptionId,
        stripeCustomerId: record.stripeCustomerId,
        priceId: record.priceId,
        status: record.status,
        currentPeriodEnd: record.currentPeriodEnd,
        cancelAtPeriodEnd: record.cancelAtPeriodEnd,
      },
      update: {
        stripeCustomerId: record.stripeCustomerId,
        priceId: record.priceId,
        status: record.status,
        currentPeriodEnd: record.currentPeriodEnd,
        cancelAtPeriodEnd: record.cancelAtPeriodEnd,
      },
    })
  }

  async deleteByStripeSubscriptionId(stripeSubscriptionId: string): Promise<void> {
    await this.db.subscription.deleteMany({ where: { stripeSubscriptionId } })
  }
}
