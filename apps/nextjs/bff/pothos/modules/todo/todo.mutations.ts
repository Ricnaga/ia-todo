import { builder } from '@/bff/pothos/builder'
import { execute } from '@/bff/errors'
import { DateTimeScalar } from '@/bff/pothos/scalars'
import { PriorityEnum } from '@/bff/pothos/modules/todo/todo.enums'
import { TodoRef, TodoSuggestionRef } from '@/bff/pothos/modules/todo/todo.ref'

builder.mutationFields((t) => ({
  createTodo: t.withAuth({ loggedIn: true }).fieldWithInput({
    type: TodoRef,
    input: {
      title: t.input.string({ required: true }),
      description: t.input.string(),
      priority: t.input.field({ type: PriorityEnum }),
      dueDate: t.input.field({ type: DateTimeScalar }),
    },
    resolve: (_root, args, ctx) => execute(() => ctx.adapters.todo.create(args.input, ctx.user.id)),
  }),
  updateTodo: t.withAuth({ loggedIn: true }).fieldWithInput({
    type: TodoRef,
    args: {
      id: t.arg.string({ required: true }),
    },
    input: {
      title: t.input.string(),
      description: t.input.string(),
      priority: t.input.field({ type: PriorityEnum }),
      dueDate: t.input.field({ type: DateTimeScalar }),
      completed: t.input.boolean(),
    },
    resolve: (_root, args, ctx) =>
      execute(() => ctx.adapters.todo.update(args.id, args.input, ctx.user.id)),
  }),
  deleteTodo: t.withAuth({ loggedIn: true }).boolean({
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      await execute(() => ctx.adapters.todo.delete(args.id, ctx.user.id))
      return true
    },
  }),
  suggestTodo: t.withAuth({ loggedIn: true }).fieldWithInput({
    type: TodoSuggestionRef,
    typeOptions: {
      name: 'DraftInput',
    },
    argOptions: {
      name: 'draft',
    },
    input: {
      title: t.input.string(),
      description: t.input.string(),
    },
    resolve: (_root, args, ctx) => execute(() => ctx.adapters.todo.suggestTodo(args.draft)),
  }),
}))
