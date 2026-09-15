import { builder } from '@/bff/graphql/builder'
import {
  CreateTodoInput,
  DraftInput,
  TodoRef,
  TodoSuggestionRef,
  UpdateTodoInput,
} from '@/bff/graphql/types'
import { execute } from '@/bff/graphql/errors'

builder.queryFields((t) => ({
  todos: t.field({
    type: [TodoRef],
    resolve: (_root, _args, ctx) => execute(() => ctx.adapters.todo.list()),
  }),
  todo: t.field({
    type: TodoRef,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_root, args, ctx) => execute(() => ctx.adapters.todo.getById(args.id)),
  }),
}))

builder.mutationFields((t) => ({
  createTodo: t.field({
    type: TodoRef,
    args: {
      input: t.arg({ type: CreateTodoInput, required: true }),
    },
    resolve: (_root, args, ctx) => execute(() => ctx.adapters.todo.create(args.input)),
  }),
  updateTodo: t.field({
    type: TodoRef,
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: UpdateTodoInput, required: true }),
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
      draft: t.arg({ type: DraftInput, required: true }),
    },
    resolve: (_root, args, ctx) => execute(() => ctx.adapters.todo.suggestTodo(args.draft)),
  }),
}))
