import { z } from 'zod'
import { billingIntervalSchema } from './billing.model'

export const createCheckoutSessionSchema = z.object({
  interval: billingIntervalSchema,
})

export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>
