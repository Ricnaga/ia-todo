import { z } from 'zod'

export const prioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])

export const subtaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  done: z.boolean().default(false),
})

export const createTodoSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000).optional(),
  priority: prioritySchema.default('medium'),
  dueDate: z.coerce.date().nullable().optional(),
})

export const updateTodoSchema = createTodoSchema.partial().extend({
  completed: z.boolean().optional(),
})

export type CreateTodoInput = z.infer<typeof createTodoSchema>
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>

export type CreateTodoFormInput = z.input<typeof createTodoSchema>
