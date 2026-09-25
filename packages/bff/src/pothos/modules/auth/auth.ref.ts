import type { AuthUser, AuthAccount, AuthSession } from '@ia-task-manager/schemas/auth'
import { builder } from '../../builder'
import { DateTimeScalar } from '../../scalars'

export const AuthUserRef = builder.objectRef<AuthUser>('AuthUser')
export const AuthAccountRef = builder.objectRef<AuthAccount>('AuthAccount')
export const AuthSessionRef = builder.objectRef<AuthSession>('AuthSession')

AuthUserRef.implement({
  fields: (t) => ({
    id: t.exposeString('id'),
    name: t.exposeString('name'),
    email: t.exposeString('email'),
    emailVerified: t.exposeBoolean('emailVerified'),
    image: t.exposeString('image', { nullable: true }),
    createdAt: t.field({ type: DateTimeScalar, resolve: (user) => user.createdAt }),
    updatedAt: t.field({ type: DateTimeScalar, resolve: (user) => user.updatedAt }),
  }),
})

AuthAccountRef.implement({
  fields: (t) => ({
    id: t.exposeString('id'),
    providerId: t.exposeString('providerId'),
    accountId: t.exposeString('accountId'),
    userId: t.exposeString('userId'),
    createdAt: t.field({ type: DateTimeScalar, resolve: (account) => account.createdAt }),
    updatedAt: t.field({ type: DateTimeScalar, resolve: (account) => account.updatedAt }),
  }),
})

AuthSessionRef.implement({
  fields: (t) => ({
    id: t.exposeString('id'),
    token: t.exposeString('token'),
    expiresAt: t.field({ type: DateTimeScalar, resolve: (session) => session.expiresAt }),
    ipAddress: t.exposeString('ipAddress', { nullable: true }),
    userAgent: t.exposeString('userAgent', { nullable: true }),
    createdAt: t.field({ type: DateTimeScalar, resolve: (session) => session.createdAt }),
    updatedAt: t.field({ type: DateTimeScalar, resolve: (session) => session.updatedAt }),
  }),
})
