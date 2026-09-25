import { builder } from '../../builder'
import { execute } from '../../../errors'
import { DaySummaryRef } from './insights.ref'

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
