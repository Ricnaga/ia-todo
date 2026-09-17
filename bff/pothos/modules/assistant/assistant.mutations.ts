import { builder } from '@/bff/pothos/builder'
import { execute } from '@/bff/pothos/errors'
import { SearchResultRef } from '@/bff/pothos/modules/assistant/assistant.ref'

builder.mutationFields((t) => ({
  nlSearch: t.field({
    type: SearchResultRef,
    args: {
      query: t.arg.string({ required: true }),
    },
    resolve: (_root, args, ctx) =>
      execute(async () => {
        const todos = await ctx.adapters.todo.list()
        return ctx.adapters.assistant.nlSearch(args.query, todos)
      }),
  }),
}))
