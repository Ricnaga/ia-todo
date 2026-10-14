export type BillingCustomerRecord = {
  userId: string
  stripeCustomerId: string
}

export interface IBillingCustomerRepository {
  findByUserId(userId: string): Promise<BillingCustomerRecord | null>
  findByStripeCustomerId(stripeCustomerId: string): Promise<BillingCustomerRecord | null>
  save(userId: string, stripeCustomerId: string): Promise<void>
}
