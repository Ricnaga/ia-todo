import { builder } from '@/bff/pothos/builder'
import { execute } from '@/bff/pothos/errors'
import { TodoRef } from '@/bff/pothos/todo/todo.ref'

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
