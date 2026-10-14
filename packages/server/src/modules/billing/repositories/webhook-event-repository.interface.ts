export interface IWebhookEventRepository {
  exists(eventId: string): Promise<boolean>
  register(eventId: string, type: string): Promise<void>
}
