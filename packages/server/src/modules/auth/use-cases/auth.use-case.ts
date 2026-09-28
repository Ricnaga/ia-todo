import { SESSION_NOT_FOUND_MESSAGE } from '../constants/error.constants'
import { runAuthAction } from '../errors/better-auth-error'
import { mapAccount, mapSession, mapUser } from '../mappers/auth.mapper'
import type { AuthInstance } from '../infra/better-auth'
import type { ISessionTokenRepository } from '../repositories/session-token.repository.interface'
import type { IAuthUseCase, AuthSessionContext } from './auth.use-case.interface'
import type { IOAuthService } from '../../../shared/oauth/oauth.interface'
import {
  AuthenticationRequiredError,
  AuthActionFailedError,
} from '../../../shared/errors/app.errors'
import type {
  AuthUser,
  AuthAccount,
  AuthSession,
  UpdateProfileOutput,
  ChangeEmailOutput,
  ChangePasswordOutput,
  UnlinkAccountOutput,
  RevokeSessionOutput,
} from '@ia-task-manager/schemas/auth'

export class AuthUseCase implements IAuthUseCase {
  constructor(
    private readonly auth: AuthInstance,
    private readonly oauth: IOAuthService,
    private readonly sessionTokens: ISessionTokenRepository,
  ) {}

  async resolveSession(headers: Headers): Promise<AuthSessionContext | null> {
    const session = await this.auth.api.getSession({ headers })
    if (!session) return null
    return {
      user: mapUser(session.user),
      session: { id: session.session.id },
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
    return sessions.map((session) => mapSession(session, current.session.id))
  }

  async revokeSession(headers: Headers, input: RevokeSessionOutput): Promise<boolean> {
    const current = await this.resolveSession(headers)
    if (!current) throw new AuthenticationRequiredError()
    const token = await this.sessionTokens.findTokenBySessionId(input.sessionId, current.user.id)
    if (!token) throw new AuthActionFailedError(SESSION_NOT_FOUND_MESSAGE)
    await runAuthAction(() => this.auth.api.revokeSession({ headers, body: { token } }))
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
