import { builder } from '@/bff/pothos/builder'
import { execute } from '@/bff/errors'
import { TodoRef } from '@/bff/pothos/modules/todo/todo.ref'

builder.queryFields((t) => ({
  todos: t.authField({
    type: [TodoRef],
    authScopes: { loggedIn: true },
    resolve: (_root, _args, ctx) => execute(() => ctx.adapters.todo.list(ctx.user.id)),
  }),
  todo: t.authField({
    type: TodoRef,
    authScopes: { loggedIn: true },
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_root, args, ctx) => execute(() => ctx.adapters.todo.getById(args.id, ctx.user.id)),
  }),
}))
