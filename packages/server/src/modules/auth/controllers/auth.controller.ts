import type { IAuthUseCase } from '../use-cases/auth.use-case.interface'
import type { UpdateProfileInput, ChangePasswordInput } from '@ia-task-manager/schemas/auth'

export class AuthController {
  constructor(private readonly authUseCase: IAuthUseCase) {}

  getProfile(headers: Headers) {
    return this.authUseCase.getProfile(headers)
  }

  updateProfile(headers: Headers, input: UpdateProfileInput) {
    const profile = { name: input.name, image: input.image }
    return this.authUseCase.updateProfile(headers, profile)
  }

  changeEmail(headers: Headers, input: { newEmail: string; callbackURL?: string }) {
    return this.authUseCase.changeEmail(headers, input)
  }

  changePassword(headers: Headers, input: ChangePasswordInput) {
    return this.authUseCase.changePassword(headers, input)
  }

  listAccounts(headers: Headers) {
    return this.authUseCase.listAccounts(headers)
  }

  unlinkAccount(headers: Headers, input: { accountId: string }) {
    return this.authUseCase.unlinkAccount(headers, input)
  }

  listSessions(headers: Headers) {
    return this.authUseCase.listSessions(headers)
  }

  revokeSession(headers: Headers, input: { token: string }) {
    return this.authUseCase.revokeSession(headers, input)
  }

  revokeOtherSessions(headers: Headers) {
    return this.authUseCase.revokeOtherSessions(headers)
  }

  getProviders() {
    return this.authUseCase.getProviders()
  }
}
