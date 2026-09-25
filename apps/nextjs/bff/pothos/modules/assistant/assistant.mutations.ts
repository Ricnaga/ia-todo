import { builder } from '@/bff/pothos/builder'
import { execute } from '@/bff/errors'
import { AssistantRef } from '@/bff/pothos/modules/assistant/assistant.ref'

builder.mutationFields((t) => ({
  nlSearch: t.authField({
    type: AssistantRef,
    authScopes: { loggedIn: true },
    args: {
      query: t.arg.string({ required: true }),
    },
    resolve: (_root, args, ctx) =>
      execute(async () => {
        const todos = await ctx.adapters.todo.list(ctx.user.id)
        return ctx.adapters.assistant.nlSearch(args.query, todos)
      }),
  }),
}))
