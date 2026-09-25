import { z } from 'zod'

export const prioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])

export const titleSchema = z.string().trim().min(1).max(200)
export const descriptionSchema = z.string().trim().min(1).max(2000)

export const subtaskSchema = z.object({
  id: z.string().min(1),
  title: titleSchema,
  done: z.boolean().default(false),
})

export const todoSchema = z.object({
  id: z.string(),
  title: titleSchema,
  description: descriptionSchema.nullable(),
  priority: prioritySchema,
  dueDate: z.coerce.date().nullable(),
  subtasks: z.array(subtaskSchema).nullable(),
  completed: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const todoSuggestionSchema = todoSchema
  .pick({ title: true, description: true, priority: true })
  .extend({
    description: descriptionSchema,
    subtasks: z.array(titleSchema).max(10),
  })

export type TodoPriority = z.infer<typeof prioritySchema>
export type TodoSubtask = z.infer<typeof subtaskSchema>
export type Todo = z.infer<typeof todoSchema>
export type TodoSuggestion = z.infer<typeof todoSuggestionSchema>
