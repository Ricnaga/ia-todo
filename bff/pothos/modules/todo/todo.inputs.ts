import { builder } from '@/bff/pothos/builder'
import { DateTimeScalar } from '@/bff/pothos/scalars'
import { PriorityEnum } from '@/bff/pothos/modules/todo/todo.enums'

export const CreateTodoGqlInput = builder.inputType('CreateTodoInput', {
  fields: (t) => ({
    title: t.string({ required: true }),
    description: t.string(),
    priority: t.field({ type: PriorityEnum }),
    dueDate: t.field({ type: DateTimeScalar }),
  }),
})

export const UpdateTodoGqlInput = builder.inputType('UpdateTodoInput', {
  fields: (t) => ({
    title: t.string(),
    description: t.string(),
    priority: t.field({ type: PriorityEnum }),
    dueDate: t.field({ type: DateTimeScalar }),
    completed: t.boolean(),
  }),
})

export const DraftGqlInput = builder.inputType('DraftInput', {
  fields: (t) => ({
    title: t.string(),
    description: t.string(),
  }),
})
