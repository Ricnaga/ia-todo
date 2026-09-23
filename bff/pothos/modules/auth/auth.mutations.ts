import { builder } from '@/bff/pothos/builder'
import { execute } from '@/bff/errors'
import { AuthUserRef } from '@/bff/pothos/modules/auth/auth.ref'

builder.mutationFields((t) => ({
  updateProfile: t.withAuth({ loggedIn: true }).fieldWithInput({
    type: AuthUserRef,
    input: {
      name: t.input.string(),
      image: t.input.string(),
    },
    resolve: (_root, args, ctx) =>
      execute(() =>
        ctx.adapters.auth.updateProfile(ctx.headers, {
          name: args.input.name ?? undefined,
          image: args.input.image ?? null,
        }),
      ),
  }),
  changeEmail: t.withAuth({ loggedIn: true }).fieldWithInput({
    type: 'Boolean',
    input: {
      newEmail: t.input.string({ required: true }),
      callbackURL: t.input.string(),
    },
    resolve: (_root, args, ctx) =>
      execute(() =>
        ctx.adapters.auth.changeEmail(ctx.headers, {
          newEmail: args.input.newEmail,
          callbackURL: args.input.callbackURL ?? undefined,
        }),
      ),
  }),
  changePassword: t.withAuth({ loggedIn: true }).fieldWithInput({
    type: 'Boolean',
    input: {
      currentPassword: t.input.string({ required: true }),
      newPassword: t.input.string({ required: true }),
    },
    resolve: (_root, args, ctx) =>
      execute(() => ctx.adapters.auth.changePassword(ctx.headers, args.input)),
  }),
  unlinkAccount: t.withAuth({ loggedIn: true }).fieldWithInput({
    type: 'Boolean',
    input: {
      accountId: t.input.string({ required: true }),
    },
    resolve: (_root, args, ctx) =>
      execute(() => ctx.adapters.auth.unlinkAccount(ctx.headers, args.input)),
  }),
  revokeSession: t.withAuth({ loggedIn: true }).fieldWithInput({
    type: 'Boolean',
    input: {
      token: t.input.string({ required: true }),
    },
    resolve: (_root, args, ctx) =>
      execute(() => ctx.adapters.auth.revokeSession(ctx.headers, args.input)),
  }),
  revokeOtherSessions: t.withAuth({ loggedIn: true }).boolean({
    resolve: (_root, _args, ctx) =>
      execute(() => ctx.adapters.auth.revokeOtherSessions(ctx.headers)),
  }),
}))
