import type { Todo, TodoSuggestion, TodoSubtask } from '@/lib/schemas/todo'
import { builder } from '@/bff/pothos/builder'
import { DateTimeScalar } from '@/bff/pothos/scalars'
import { PriorityEnum } from '@/bff/pothos/modules/todo/todo.enums'

export const TodoRef = builder.objectRef<Todo>('Todo')

const SubtaskRef = builder.objectRef<TodoSubtask>('Subtask')

export const TodoSuggestionRef = builder.objectRef<TodoSuggestion>('TodoSuggestion')

SubtaskRef.implement({
  fields: (t) => ({
    id: t.exposeString('id'),
    title: t.exposeString('title'),
    done: t.exposeBoolean('done'),
  }),
})

TodoRef.implement({
  fields: (t) => ({
    id: t.exposeString('id'),
    title: t.exposeString('title'),
    description: t.exposeString('description', { nullable: true }),
    priority: t.expose('priority', { type: PriorityEnum }),
    dueDate: t.field({
      type: DateTimeScalar,
      nullable: true,
      resolve: (todo) => todo.dueDate,
    }),
    subtasks: t.field({
      type: [SubtaskRef],
      nullable: true,
      resolve: (todo) => todo.subtasks ?? undefined,
    }),
    completed: t.exposeBoolean('completed'),
    createdAt: t.field({
      type: DateTimeScalar,
      resolve: (todo) => todo.createdAt,
    }),
    updatedAt: t.field({
      type: DateTimeScalar,
      resolve: (todo) => todo.updatedAt,
    }),
  }),
})

TodoSuggestionRef.implement({
  fields: (t) => ({
    title: t.exposeString('title'),
    description: t.exposeString('description'),
    priority: t.expose('priority', { type: PriorityEnum }),
    subtasks: t.exposeStringList('subtasks'),
  }),
})
