export interface EntitlementsService {
  hasAiAccess(userId: string): Promise<boolean>
}
