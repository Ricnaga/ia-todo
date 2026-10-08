import { z } from 'zod'
import { prioritySchema, titleSchema } from './todo.model'

export const descriptionInputSchema = z
  .union([z.string().trim().max(2000), z.null(), z.undefined()])
  .transform((value) => {
    if (value === undefined || value === null) return value
    const trimmed = value.trim()
    return trimmed ? trimmed : null
  })

export const dueDateInputSchema = z
  .union([z.literal(''), z.coerce.date<string | Date>(), z.null(), z.undefined()])
  .transform((value) => (value === '' ? null : value))

export const createTodoSchema = z.object({
  title: titleSchema,
  description: descriptionInputSchema.optional(),
  priority: prioritySchema
    .nullish()
    .default('medium')
    .transform((v) => v ?? 'medium'),
  dueDate: dueDateInputSchema.optional(),
})

export const updateTodoSchema = z.object({
  title: titleSchema.nullish().transform((v) => v ?? undefined),
  description: descriptionInputSchema.optional(),
  priority: prioritySchema.nullish().transform((v) => v ?? undefined),
  dueDate: dueDateInputSchema.optional(),
  completed: z
    .boolean()
    .nullish()
    .transform((v) => v ?? undefined),
})

export const draftInputSchema = z
  .object({
    title: titleSchema.nullish().transform((v) => v ?? undefined),
    description: descriptionInputSchema.optional().transform((v) => v ?? undefined),
  })
  .refine((draft) => Boolean(draft.title || draft.description), {
    message: 'Informe um título ou uma descrição para a IA sugerir.',
  })

export type CreateTodoInput = z.input<typeof createTodoSchema>
export type CreateTodoOutput = z.infer<typeof createTodoSchema>
export type UpdateTodoInput = z.input<typeof updateTodoSchema>
export type UpdateTodoOutput = z.infer<typeof updateTodoSchema>
export type DraftInput = z.input<typeof draftInputSchema>
export type CreateTodoFormInput = CreateTodoInput
