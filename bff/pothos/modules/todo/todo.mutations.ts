import { builder } from '@/bff/pothos/builder'
import { execute } from '@/bff/pothos/errors'
import {
  CreateTodoGqlInput,
  UpdateTodoGqlInput,
  DraftGqlInput,
} from '@/bff/pothos/modules/todo/todo.inputs'
import { TodoRef, TodoSuggestionRef } from '@/bff/pothos/modules/todo/todo.ref'

builder.mutationFields((t) => ({
  createTodo: t.field({
    type: TodoRef,
    args: {
      input: t.arg({ type: CreateTodoGqlInput, required: true }),
    },
    resolve: (_root, args, ctx) => execute(() => ctx.adapters.todo.create(args.input)),
  }),
  updateTodo: t.field({
    type: TodoRef,
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: UpdateTodoGqlInput, required: true }),
    },
    resolve: (_root, args, ctx) => execute(() => ctx.adapters.todo.update(args.id, args.input)),
  }),
  deleteTodo: t.boolean({
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      await execute(() => ctx.adapters.todo.delete(args.id))
      return true
    },
  }),
  suggestTodo: t.field({
    type: TodoSuggestionRef,
    args: {
      draft: t.arg({ type: DraftGqlInput, required: true }),
    },
    resolve: (_root, args, ctx) => execute(() => ctx.adapters.todo.suggestTodo(args.draft)),
  }),
}))
