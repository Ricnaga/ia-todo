import { request } from '@/services/graphql/base'
import {
  authUserSchema,
  authAccountSchema,
  authSessionSchema,
  type AuthUser,
  type AuthAccount,
  type AuthSession,
} from '@/lib/schemas/auth'

type RequestHeaders = Record<string, string>

export const AUTH_USER_FIELDS = `
  id
  name
  email
  emailVerified
  image
  createdAt
  updatedAt
`

export const AUTH_ACCOUNT_FIELDS = `
  id
  providerId
  accountId
  userId
  createdAt
  updatedAt
`

export const AUTH_SESSION_FIELDS = `
  id
  token
  expiresAt
  ipAddress
  userAgent
  createdAt
  updatedAt
`

const toUser = (raw: unknown): AuthUser => authUserSchema.parse(raw)
const toAccount = (raw: unknown): AuthAccount => authAccountSchema.parse(raw)
const toSession = (raw: unknown): AuthSession => authSessionSchema.parse(raw)

export async function fetchMe(): Promise<AuthUser | null> {
  const data = await request<{ me: unknown | null }>(`
    query Me {
      me {
        ${AUTH_USER_FIELDS}
      }
    }
  `)
  return data.me ? toUser(data.me) : null
}

export async function fetchMyAccounts(requestHeaders?: RequestHeaders): Promise<AuthAccount[]> {
  const data = await request<{ myAccounts: unknown[] }>(
    `
    query MyAccounts {
      myAccounts {
        ${AUTH_ACCOUNT_FIELDS}
      }
    }
  `,
    undefined,
    requestHeaders,
  )
  return data.myAccounts.map(toAccount)
}

export async function fetchMySessions(requestHeaders?: RequestHeaders): Promise<AuthSession[]> {
  const data = await request<{ mySessions: unknown[] }>(
    `
    query MySessions {
      mySessions {
        ${AUTH_SESSION_FIELDS}
      }
    }
  `,
    undefined,
    requestHeaders,
  )
  return data.mySessions.map(toSession)
}

export async function updateProfileRequest(input: {
  name?: string
  image?: string | null
}): Promise<AuthUser> {
  const data = await request<{ updateProfile: unknown }>(
    `
      mutation UpdateProfile($input: UpdateProfileInput!) {
        updateProfile(input: $input) {
          ${AUTH_USER_FIELDS}
        }
      }
    `,
    { input },
  )
  return toUser(data.updateProfile)
}

export async function changeEmailRequest(input: {
  newEmail: string
  callbackURL?: string
}): Promise<boolean> {
  const data = await request<{ changeEmail: boolean }>(
    `
      mutation ChangeEmail($input: ChangeEmailInput!) {
        changeEmail(input: $input)
      }
    `,
    { input },
  )
  return data.changeEmail
}

export async function changePasswordRequest(input: {
  currentPassword: string
  newPassword: string
}): Promise<boolean> {
  const data = await request<{ changePassword: boolean }>(
    `
      mutation ChangePassword($input: ChangePasswordInput!) {
        changePassword(input: $input)
      }
    `,
    { input },
  )
  return data.changePassword
}

export async function unlinkAccountRequest(input: { accountId: string }): Promise<boolean> {
  const data = await request<{ unlinkAccount: boolean }>(
    `
      mutation UnlinkAccount($input: UnlinkAccountInput!) {
        unlinkAccount(input: $input)
      }
    `,
    { input },
  )
  return data.unlinkAccount
}

export async function revokeSessionRequest(input: { token: string }): Promise<boolean> {
  const data = await request<{ revokeSession: boolean }>(
    `
      mutation RevokeSession($input: RevokeSessionInput!) {
        revokeSession(input: $input)
      }
    `,
    { input },
  )
  return data.revokeSession
}

export async function revokeOtherSessionsRequest(): Promise<boolean> {
  const data = await request<{ revokeOtherSessions: boolean }>(`
    mutation RevokeOtherSessions {
      revokeOtherSessions
    }
  `)
  return data.revokeOtherSessions
}
