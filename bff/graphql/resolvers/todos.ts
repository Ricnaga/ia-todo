import { builder } from '@/bff/graphql/builder'
import { CreateTodoInput, TodoRef, UpdateTodoInput } from '@/bff/graphql/types'
import { execute } from '@/bff/graphql/errors'

builder.queryFields((t) => ({
  todos: t.field({
    type: [TodoRef],
    resolve: (_root, _args, ctx) => execute(() => ctx.todos.list()),
  }),
  todo: t.field({
    type: TodoRef,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_root, args, ctx) => execute(() => ctx.todos.getById(args.id)),
  }),
}))

builder.mutationFields((t) => ({
  createTodo: t.field({
    type: TodoRef,
    args: {
      input: t.arg({ type: CreateTodoInput, required: true }),
    },
    resolve: (_root, args, ctx) => execute(() => ctx.todos.create(args.input)),
  }),
  updateTodo: t.field({
    type: TodoRef,
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: UpdateTodoInput, required: true }),
    },
    resolve: (_root, args, ctx) => execute(() => ctx.todos.update(args.id, args.input)),
  }),
  deleteTodo: t.boolean({
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      await execute(() => ctx.todos.delete(args.id))
      return true
    },
  }),
}))
