import { builder } from '../../builder'
import { execute } from '../../../errors'
import { BillingIntervalEnum } from './billing.enums'

builder.mutationFields((t) => ({
  createCheckoutSession: t.withAuth({ loggedIn: true }).fieldWithInput({
    type: 'String',
    input: {
      interval: t.input.field({ type: BillingIntervalEnum, required: true }),
    },
    resolve: (_root, args, ctx) =>
      execute(async () => {
        const { url } = await ctx.adapters.billing.createCheckoutSession({
          userId: ctx.user.id,
          email: ctx.user.email,
          interval: args.input.interval,
        })
        return url
      }),
  }),
  createPortalSession: t.withAuth({ loggedIn: true }).field({
    type: 'String',
    resolve: (_root, _args, ctx) =>
      execute(async () => {
        const { url } = await ctx.adapters.billing.createPortalSession(ctx.user.id)
        return url
      }),
  }),
}))
