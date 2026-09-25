import type {
  AuthUser,
  AuthAccount,
  AuthSession,
  UpdateProfileInput,
  ChangeEmailInput,
  ChangePasswordInput,
  UnlinkAccountInput,
  RevokeSessionInput,
} from '@/lib/schemas/auth'

export type AuthUpdateProfileInput = UpdateProfileInput
export type AuthChangeEmailInput = ChangeEmailInput
export type AuthChangePasswordInput = ChangePasswordInput
export type AuthUnlinkAccountInput = UnlinkAccountInput
export type AuthRevokeSessionInput = RevokeSessionInput

export interface AuthPort {
  me(headers: Headers): Promise<AuthUser>
  updateProfile(headers: Headers, input: AuthUpdateProfileInput): Promise<AuthUser>
  changeEmail(headers: Headers, input: AuthChangeEmailInput): Promise<boolean>
  changePassword(headers: Headers, input: AuthChangePasswordInput): Promise<boolean>
  listAccounts(headers: Headers): Promise<AuthAccount[]>
  unlinkAccount(headers: Headers, input: AuthUnlinkAccountInput): Promise<boolean>
  listSessions(headers: Headers): Promise<AuthSession[]>
  revokeSession(headers: Headers, input: AuthRevokeSessionInput): Promise<boolean>
  revokeOtherSessions(headers: Headers): Promise<boolean>
}
