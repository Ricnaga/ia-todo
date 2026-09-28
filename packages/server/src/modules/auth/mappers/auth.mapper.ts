import type { AuthAccount, AuthSession, AuthUser } from '@ia-task-manager/schemas/auth'
import type { AuthInstance } from '../infra/better-auth'

type AuthApi = AuthInstance['api']

type SessionResponse = NonNullable<Awaited<ReturnType<AuthApi['getSession']>>>

export type AuthUserRow = SessionResponse['user']
export type AuthAccountRow = Awaited<ReturnType<AuthApi['listUserAccounts']>>[number]
export type AuthSessionRow = Awaited<ReturnType<AuthApi['listSessions']>>[number]

export function mapUser(user: AuthUserRow): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export function mapAccount(account: AuthAccountRow): AuthAccount {
  return {
    id: account.id,
    providerId: account.providerId,
    accountId: account.accountId,
    userId: account.userId,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  }
}

export function mapSession(session: AuthSessionRow, currentSessionId: string): AuthSession {
  return {
    id: session.id,
    isCurrent: session.id === currentSessionId,
    expiresAt: session.expiresAt,
    ipAddress: session.ipAddress ?? null,
    userAgent: session.userAgent ?? null,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  }
}
