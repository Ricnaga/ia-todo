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
import type { AuthProvider } from '../../../shared/oauth/oauth.interface'

export type AuthSessionContext = {
  user: AuthUser
  session: { id: string; token: string }
}

export interface IAuthUseCase {
  resolveSession(headers: Headers): Promise<AuthSessionContext | null>
  getProfile(headers: Headers): Promise<AuthUser>
  updateProfile(headers: Headers, input: UpdateProfileOutput): Promise<AuthUser>
  changeEmail(headers: Headers, input: ChangeEmailOutput): Promise<boolean>
  changePassword(headers: Headers, input: ChangePasswordOutput): Promise<boolean>
  listAccounts(headers: Headers): Promise<AuthAccount[]>
  unlinkAccount(headers: Headers, input: UnlinkAccountOutput): Promise<boolean>
  listSessions(headers: Headers): Promise<AuthSession[]>
  revokeSession(headers: Headers, input: RevokeSessionOutput): Promise<boolean>
  revokeOtherSessions(headers: Headers): Promise<boolean>
  getProviders(): AuthProvider[]
}
