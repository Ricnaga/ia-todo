import { request } from '@/services/graphql/base'
import type { RequestHeaders } from '@/services/graphql/graphql.types'
import {
  ChangeEmailDocument,
  ChangePasswordDocument,
  MeDocument,
  MyAccountsDocument,
  MySessionsDocument,
  RevokeOtherSessionsDocument,
  RevokeSessionDocument,
  UnlinkAccountDocument,
  UpdateProfileDocument,
} from '@ia-task-manager/bff/graphql'
import type {
  ChangeEmailRequest,
  ChangePasswordRequest,
  RevokeSessionRequest,
  UnlinkAccountRequest,
  UpdateProfileRequest,
} from './auth.types'
import {
  authUserSchema,
  authAccountSchema,
  authSessionSchema,
  type AuthUser,
  type AuthAccount,
  type AuthSession,
} from '@ia-task-manager/schemas/auth'

export async function fetchMe(headers?: RequestHeaders): Promise<AuthUser | null> {
  const data = await request({ document: MeDocument, headers })
  return data.me ? authUserSchema.parse(data.me) : null
}

export async function fetchMyAccounts(headers?: RequestHeaders): Promise<AuthAccount[]> {
  const data = await request({ document: MyAccountsDocument, headers })
  return data.myAccounts.map((account) => authAccountSchema.parse(account))
}

export async function fetchMySessions(headers?: RequestHeaders): Promise<AuthSession[]> {
  const data = await request({ document: MySessionsDocument, headers })
  return data.mySessions.map((session) => authSessionSchema.parse(session))
}

export async function updateProfileRequest(input: UpdateProfileRequest): Promise<AuthUser> {
  const data = await request({ document: UpdateProfileDocument, variables: { input } })
  return authUserSchema.parse(data.updateProfile)
}

export async function changeEmailRequest(input: ChangeEmailRequest): Promise<boolean> {
  const data = await request({ document: ChangeEmailDocument, variables: { input } })
  return data.changeEmail
}

export async function changePasswordRequest(input: ChangePasswordRequest): Promise<boolean> {
  const data = await request({ document: ChangePasswordDocument, variables: { input } })
  return data.changePassword
}

export async function unlinkAccountRequest(input: UnlinkAccountRequest): Promise<boolean> {
  const data = await request({ document: UnlinkAccountDocument, variables: { input } })
  return data.unlinkAccount
}

export async function revokeSessionRequest(input: RevokeSessionRequest): Promise<boolean> {
  const data = await request({ document: RevokeSessionDocument, variables: { input } })
  return data.revokeSession
}

export async function revokeOtherSessionsRequest(): Promise<boolean> {
  const data = await request({ document: RevokeOtherSessionsDocument })
  return data.revokeOtherSessions
}
