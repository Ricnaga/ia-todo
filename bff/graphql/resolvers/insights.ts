import { builder } from '@/bff/graphql/builder'
import { DaySummaryRef } from '@/bff/graphql/types'
import { execute } from '@/bff/graphql/errors'

builder.mutationFields((t) => ({
  summarizeDay: t.field({
    type: DaySummaryRef,
    resolve: (_root, _args, ctx) =>
      execute(async () => {
        const todos = await ctx.adapters.todo.list()
        return ctx.adapters.insights.summarizeDay(todos)
      }),
  }),
}))
