import { builder } from '@/bff/pothos/builder'
import { execute } from '@/bff/pothos/errors'
import { DaySummaryRef } from '@/bff/pothos/insights/insights.ref'

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
