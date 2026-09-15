import { builder } from '@/bff/graphql/builder'
import { SearchResultRef } from '@/bff/graphql/types'
import { execute } from '@/bff/graphql/errors'

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
