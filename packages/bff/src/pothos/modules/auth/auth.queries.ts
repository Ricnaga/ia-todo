import { builder } from '../../builder'
import { execute } from '../../../errors'
import { AuthUserRef, AuthAccountRef, AuthSessionRef } from './auth.ref'

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
