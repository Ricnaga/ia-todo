import { z } from 'zod'

export const prioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])

const titleSchema = z.string().trim().min(1).max(200)
const descriptionSchema = z.string().trim().min(1).max(2000)

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

export const createTodoSchema = todoSchema
  .pick({ title: true, description: true, priority: true, dueDate: true })
  .extend({
    description: descriptionSchema.optional(),
    priority: prioritySchema.default('medium'),
    dueDate: z.coerce.date().nullable().optional(),
  })

export const updateTodoSchema = createTodoSchema.partial().extend({
  completed: z.boolean().optional(),
})

export const draftInputSchema = todoSchema
  .pick({ title: true, description: true })
  .partial()
  .extend({ description: descriptionSchema.optional() })
  .refine((draft) => Boolean(draft.title || draft.description), {
    message: 'Informe um título ou uma descrição para a IA sugerir.',
  })

export const todoSuggestionSchema = todoSchema
  .pick({ title: true, description: true, priority: true })
  .extend({
    description: descriptionSchema,
    subtasks: z.array(titleSchema).max(10),
  })

export type CreateTodoInput = z.infer<typeof createTodoSchema>
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>

export type CreateTodoFormInput = z.input<typeof createTodoSchema>

export type DraftInput = z.infer<typeof draftInputSchema>
export type TodoSuggestion = z.infer<typeof todoSuggestionSchema>

export type TodoPriority = z.infer<typeof prioritySchema>
export type TodoSubtask = z.infer<typeof subtaskSchema>
export type Todo = z.infer<typeof todoSchema>
