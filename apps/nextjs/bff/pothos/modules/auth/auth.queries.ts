import { builder } from '@/bff/pothos/builder'
import { execute } from '@/bff/errors'
import { AuthUserRef, AuthAccountRef, AuthSessionRef } from '@/bff/pothos/modules/auth/auth.ref'

builder.queryFields((t) => ({
  me: t.field({
    type: AuthUserRef,
    nullable: true,
    skipTypeScopes: true,
    resolve: (_root, _args, ctx) => ctx.user,
  }),
  myAccounts: t.field({
    type: [AuthAccountRef],
    resolve: (_root, _args, ctx) => execute(() => ctx.adapters.auth.listAccounts(ctx.headers)),
  }),
  mySessions: t.field({
    type: [AuthSessionRef],
    resolve: (_root, _args, ctx) => execute(() => ctx.adapters.auth.listSessions(ctx.headers)),
  }),
}))
