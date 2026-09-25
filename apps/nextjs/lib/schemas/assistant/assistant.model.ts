import { z } from 'zod'
import { todoSchema } from '@/lib/schemas/todo'

export const criteriaSchema = z.object({
  query: z.string().trim().min(1).max(200),
  keywords: z.array(z.string().trim().min(1).max(100)).max(20),
  status: z.enum(['any', 'pending', 'completed']),
  priority: z.enum(['any', 'low', 'medium', 'high', 'urgent']),
  due: z.enum(['any', 'today', 'thisWeek', 'overdue', 'none']),
})

export const assistantSchema = z.object({
  criteria: criteriaSchema,
  todos: z.array(todoSchema),
})

export type Criteria = z.infer<typeof criteriaSchema>
export type Assistant = z.infer<typeof assistantSchema>
