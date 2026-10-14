import type { PrismaClient } from '../../../db/generated/prisma/client'
import type { IWebhookEventRepository } from '../repositories/webhook-event-repository.interface'

export class PrismaWebhookEventRepository implements IWebhookEventRepository {
  constructor(private readonly db: PrismaClient) {}

  async exists(eventId: string): Promise<boolean> {
    const row = await this.db.webhookEvent.findUnique({ where: { eventId } })
    return row !== null
  }

  async register(eventId: string, type: string): Promise<void> {
    await this.db.webhookEvent.create({ data: { eventId, type } })
  }
}
