import { z } from 'zod'

export const daySummaryTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  note: z.string().trim().max(300),
})

export const daySummarySchema = z.object({
  summary: z.string().trim().min(1).max(2000),
  focus: z.string().trim().min(1).max(500),
  tasks: z.array(daySummaryTaskSchema).max(20),
})

export type DaySummaryTask = z.infer<typeof daySummaryTaskSchema>
export type DaySummary = z.infer<typeof daySummarySchema>
