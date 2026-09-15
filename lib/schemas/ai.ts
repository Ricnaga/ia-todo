import { z } from 'zod'
import { prioritySchema } from '@/lib/schemas/todo'

export const draftInputSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(2000).optional(),
  })
  .refine((draft) => Boolean(draft.title || draft.description), {
    message: 'Informe um título ou uma descrição para a IA sugerir.',
  })

export const todoSuggestionSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000),
  priority: prioritySchema,
  subtasks: z.array(z.string().trim().min(1).max(200)).max(10),
})

export const daySummarySchema = z.object({
  summary: z.string().trim().min(1).max(2000),
  focus: z.string().trim().min(1).max(500),
  suggestedOrder: z.array(z.string().trim().min(1).max(200)).max(20),
})

export const searchCriteriaSchema = z.object({
  query: z.string().trim().min(1).max(200),
  keywords: z.array(z.string().trim().min(1).max(100)).max(20),
  status: z.enum(['any', 'pending', 'completed']),
  priority: z.enum(['any', 'low', 'medium', 'high', 'urgent']),
  due: z.enum(['any', 'today', 'thisWeek', 'overdue', 'none']),
})

export type DraftInput = z.infer<typeof draftInputSchema>
export type TodoSuggestion = z.infer<typeof todoSuggestionSchema>
export type DaySummary = z.infer<typeof daySummarySchema>
export type SearchCriteria = z.infer<typeof searchCriteriaSchema>
