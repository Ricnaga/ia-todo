import { builder } from '../../builder'
import { execute } from '../../../errors'
import { AssistantRef } from './assistant.ref'

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
