import { z } from 'zod'

export const billingPlanSchema = z.enum(['free', 'pro'])

export const billingIntervalSchema = z.enum(['monthly', 'yearly'])

export const subscriptionStatusSchema = z.enum([
  'active',
  'trialing',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'unpaid',
  'paused',
])

export const subscriptionSchema = z.object({
  plan: billingPlanSchema,
  status: subscriptionStatusSchema.nullable(),
  currentPeriodEnd: z.coerce.date().nullable(),
  cancelAtPeriodEnd: z.boolean(),
})

export type BillingPlan = z.infer<typeof billingPlanSchema>
export type BillingInterval = z.infer<typeof billingIntervalSchema>
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>
export type Subscription = z.infer<typeof subscriptionSchema>
