import { builder } from '@/bff/pothos/builder'
import { DateTimeScalar } from '@/bff/pothos/scalars'
import { PriorityEnum } from '@/bff/pothos/modules/todo/todo.enums'

export const CreateTodoInput = builder.inputType('CreateTodoInput', {
  fields: (t) => ({
    title: t.string({ required: true }),
    description: t.string(),
    priority: t.field({ type: PriorityEnum }),
    dueDate: t.field({ type: DateTimeScalar }),
  }),
})

export const UpdateTodoInput = builder.inputType('UpdateTodoInput', {
  fields: (t) => ({
    title: t.string(),
    description: t.string(),
    priority: t.field({ type: PriorityEnum }),
    dueDate: t.field({ type: DateTimeScalar }),
    completed: t.boolean(),
  }),
})

export const DraftInput = builder.inputType('DraftInput', {
  fields: (t) => ({
    title: t.string(),
    description: t.string(),
  }),
})
