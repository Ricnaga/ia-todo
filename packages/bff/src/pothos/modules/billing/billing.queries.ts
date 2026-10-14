import { builder } from '../../builder'
import { execute } from '../../../errors'
import { SubscriptionRef } from './billing.ref'

builder.queryFields((t) => ({
  mySubscription: t.authField({
    type: SubscriptionRef,
    authScopes: { loggedIn: true },
    resolve: (_root, _args, ctx) =>
      execute(() => ctx.adapters.billing.getSubscription(ctx.user.id)),
  }),
}))
