import { z } from 'zod'

export const searchCriteriaSchema = z.object({
  query: z.string().trim().min(1).max(200),
  keywords: z.array(z.string().trim().min(1).max(100)).max(20),
  status: z.enum(['any', 'pending', 'completed']),
  priority: z.enum(['any', 'low', 'medium', 'high', 'urgent']),
  due: z.enum(['any', 'today', 'thisWeek', 'overdue', 'none']),
})

export type SearchCriteria = z.infer<typeof searchCriteriaSchema>
