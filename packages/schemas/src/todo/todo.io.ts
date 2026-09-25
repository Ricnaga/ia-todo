import { z } from 'zod'
import { prioritySchema, titleSchema, descriptionSchema } from './todo.model'

export const createTodoSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.nullish(),
  priority: prioritySchema
    .nullish()
    .default('medium')
    .transform((v) => v ?? 'medium'),
  dueDate: z.coerce.date().nullable().optional(),
})

export const updateTodoSchema = z.object({
  title: titleSchema.nullish().transform((v) => v ?? undefined),
  description: descriptionSchema.nullish(),
  priority: prioritySchema.nullish().transform((v) => v ?? undefined),
  dueDate: z.coerce.date().nullable().optional(),
  completed: z
    .boolean()
    .nullish()
    .transform((v) => v ?? undefined),
})

export const draftInputSchema = z
  .object({
    title: titleSchema.nullish().transform((v) => v ?? undefined),
    description: descriptionSchema.nullish().transform((v) => v ?? undefined),
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
