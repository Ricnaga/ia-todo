import { z } from 'zod'

export const daySummarySchema = z.object({
  summary: z.string().trim().min(1).max(2000),
  focus: z.string().trim().min(1).max(500),
  suggestedOrder: z.array(z.string().trim().min(1).max(200)).max(20),
})

export type DaySummary = z.infer<typeof daySummarySchema>
