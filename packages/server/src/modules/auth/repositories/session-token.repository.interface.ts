export interface ISessionTokenRepository {
  findTokenBySessionId(sessionId: string, userId: string): Promise<string | null>
}
