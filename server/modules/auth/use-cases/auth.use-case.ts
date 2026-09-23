import type { AuthInstance } from '@/server/modules/auth/infra/better-auth'
import type {
  IAuthUseCase,
  AuthSessionContext,
} from '@/server/modules/auth/use-cases/auth.use-case.interface'
import type { IOAuthService } from '@/server/shared/oauth/oauth.interface'
import {
  AuthenticationRequiredError,
  AuthActionFailedError,
} from '@/server/shared/errors/app.errors'
import type {
  AuthUser,
  AuthAccount,
  AuthSession,
  UpdateProfileOutput,
  ChangeEmailOutput,
  ChangePasswordOutput,
  UnlinkAccountOutput,
  RevokeSessionOutput,
} from '@/lib/schemas/auth'

type BetterAuthApiError = Error & {
  status?: string
  statusCode?: number
  body?: { message?: string; code?: string }
}

const AUTH_ERROR_MESSAGES = {
  INVALID_PASSWORD: 'Senha atual incorreta.',
  PROVIDER_NOT_FOUND: 'Este provedor de login não está configurado.',
  FAILED_TO_UNLINK_LAST_ACCOUNT: 'Não é possível desvincular a única conta.',
  ACCOUNT_NOT_FOUND: 'Conta não encontrada.',
  CREDENTIAL_ACCOUNT_NOT_FOUND: 'Conta de e-mail/senha não encontrada.',
} as const

const GENERIC_ERROR_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.'

function runAuthAction<T>(action: () => Promise<T>): Promise<T> {
  return action().catch((error: unknown) => {
    throw new AuthActionFailedError(authErrorMessage(error))
  })
}

function authErrorMessage(error: unknown): string {
  const apiError = error as BetterAuthApiError
  if (!apiError?.name || apiError.name !== 'APIError') {
    return GENERIC_ERROR_MESSAGE
  }
  const code = apiError.body?.code as keyof typeof AUTH_ERROR_MESSAGES | undefined
  return (
    (code ? AUTH_ERROR_MESSAGES[code] : undefined) ??
    apiError.body?.message ??
    GENERIC_ERROR_MESSAGE
  )
}

function mapUser(user: {
  id: string
  email: string
  emailVerified: boolean
  name: string
  image?: string | null
  createdAt: Date
  updatedAt: Date
}): AuthUser {
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

function mapAccount(account: {
  id: string
  accountId: string
  providerId: string
  userId: string
  createdAt?: Date
  updatedAt?: Date
}): AuthAccount {
  return {
    id: account.id,
    providerId: account.providerId,
    accountId: account.accountId,
    userId: account.userId,
    createdAt: account.createdAt ?? new Date(0),
    updatedAt: account.updatedAt ?? new Date(0),
  }
}

function mapSession(session: {
  id: string
  token: string
  expiresAt: Date
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: Date
  updatedAt: Date
}): AuthSession {
  return {
    id: session.id,
    token: session.token,
    expiresAt: session.expiresAt,
    ipAddress: session.ipAddress ?? null,
    userAgent: session.userAgent ?? null,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  }
}

export class AuthUseCase implements IAuthUseCase {
  constructor(
    private readonly auth: AuthInstance,
    private readonly oauth: IOAuthService,
  ) {}

  async resolveSession(headers: Headers): Promise<AuthSessionContext | null> {
    const session = await this.auth.api.getSession({ headers })
    if (!session) return null
    return {
      user: mapUser(session.user),
      session: { id: session.session.id, token: session.session.token },
    }
  }

  async getProfile(headers: Headers): Promise<AuthUser> {
    const context = await this.resolveSession(headers)
    if (!context) throw new AuthenticationRequiredError()
    return context.user
  }

  async updateProfile(headers: Headers, input: UpdateProfileOutput): Promise<AuthUser> {
    await runAuthAction(() => this.auth.api.updateUser({ headers, body: input }))
    const session = await this.auth.api.getSession({ headers })
    if (!session) throw new AuthenticationRequiredError()
    return mapUser(session.user)
  }

  async changeEmail(headers: Headers, input: ChangeEmailOutput): Promise<boolean> {
    const response = await runAuthAction(() =>
      this.auth.api.changeEmail({
        headers,
        body: { newEmail: input.newEmail, callbackURL: input.callbackURL },
      }),
    )
    return response.status
  }

  async changePassword(headers: Headers, input: ChangePasswordOutput): Promise<boolean> {
    await runAuthAction(() =>
      this.auth.api.changePassword({
        headers,
        body: {
          newPassword: input.newPassword,
          currentPassword: input.currentPassword,
        },
      }),
    )
    return true
  }

  async listAccounts(headers: Headers): Promise<AuthAccount[]> {
    const accounts = await this.auth.api.listUserAccounts({ headers })
    return accounts.map(mapAccount)
  }

  async unlinkAccount(headers: Headers, input: UnlinkAccountOutput): Promise<boolean> {
    const response = await runAuthAction(() =>
      this.auth.api.unlinkAccount({ headers, body: { accountId: input.accountId } }),
    )
    return response.status
  }

  async listSessions(headers: Headers): Promise<AuthSession[]> {
    const current = await this.resolveSession(headers)
    if (!current) throw new AuthenticationRequiredError()
    const sessions = await this.auth.api.listSessions({ headers })
    return sessions.map(mapSession)
  }

  async revokeSession(headers: Headers, input: RevokeSessionOutput): Promise<boolean> {
    await runAuthAction(() =>
      this.auth.api.revokeSession({ headers, body: { token: input.token } }),
    )
    return true
  }

  async revokeOtherSessions(headers: Headers): Promise<boolean> {
    const response = await runAuthAction(() => this.auth.api.revokeOtherSessions({ headers }))
    return response.status
  }

  getProviders() {
    return this.oauth.getProviders()
  }
}
