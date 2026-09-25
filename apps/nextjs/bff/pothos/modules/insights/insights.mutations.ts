import { builder } from '@/bff/pothos/builder'
import { execute } from '@/bff/errors'
import { DaySummaryRef } from '@/bff/pothos/modules/insights/insights.ref'

builder.mutationFields((t) => ({
  summarizeDay: t.authField({
    type: DaySummaryRef,
    authScopes: { loggedIn: true },
    resolve: (_root, _args, ctx) =>
      execute(async () => {
        const todos = await ctx.adapters.todo.list(ctx.user.id)
        return ctx.adapters.insights.summarizeDay(todos)
      }),
  }),
}))
