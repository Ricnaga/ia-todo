import { builder } from '@/bff/graphql/builder'
import { DaySummaryRef, DraftInput, SearchResultRef, TodoSuggestionRef } from '@/bff/graphql/types'
import { execute } from '@/bff/graphql/errors'

builder.mutationFields((t) => ({
  suggestTodo: t.field({
    type: TodoSuggestionRef,
    args: {
      draft: t.arg({ type: DraftInput, required: true }),
    },
    resolve: (_root, args, ctx) => execute(() => ctx.ai.suggestTodo(args.draft)),
  }),
  summarizeDay: t.field({
    type: DaySummaryRef,
    resolve: (_root, _args, ctx) =>
      execute(async () => {
        const todos = await ctx.todos.list()
        return ctx.ai.summarizeDay(todos.filter((todo) => !todo.completed))
      }),
  }),
  nlSearch: t.field({
    type: SearchResultRef,
    args: {
      query: t.arg.string({ required: true }),
    },
    resolve: (_root, args, ctx) =>
      execute(async () => {
        const todos = await ctx.todos.list()
        return ctx.ai.nlSearch(args.query, todos)
      }),
  }),
}))
