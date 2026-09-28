import type { PrismaClient } from '../../../db/generated/prisma/client'
import type { ISessionTokenRepository } from '../repositories/session-token.repository.interface'

export class PrismaSessionTokenRepository implements ISessionTokenRepository {
  constructor(private readonly db: PrismaClient) {}

  async findTokenBySessionId(sessionId: string, userId: string): Promise<string | null> {
    const row = await this.db.session.findFirst({
      where: { id: sessionId, userId },
      select: { token: true },
    })
    return row?.token ?? null
  }
}
