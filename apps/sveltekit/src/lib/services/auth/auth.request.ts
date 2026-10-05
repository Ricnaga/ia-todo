import { request } from '$lib/services/graphql/base'
import type { GraphQLFetch } from '$lib/services/graphql/graphql.types'
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
  authAccountSchema,
  authSessionSchema,
  authUserSchema,
  type AuthAccount,
  type AuthSession,
  type AuthUser,
} from '@ia-task-manager/schemas/auth'

/**
 * O `me` e a unica resposta nullable do app: sem sessao o BFF devolve `null` em
 * vez de erro, e o guard de sessao depende disso. Por isso o `fetchMe` checa o
 * `null` explicitamente em vez de deixar o zod decidir -- `authUserSchema.parse`
 * rejeitaria `null` com "expected object, received null", que seria a mensagem
 * errada para o caso que mais importa aqui.
 */
export async function fetchMe(graphqlFetch?: GraphQLFetch): Promise<AuthUser | null> {
  const data = await request({ document: MeDocument, graphqlFetch })
  return data.me ? authUserSchema.parse(data.me) : null
}

export async function fetchMyAccounts(graphqlFetch?: GraphQLFetch): Promise<AuthAccount[]> {
  const data = await request({ document: MyAccountsDocument, graphqlFetch })
  return data.myAccounts.map((account) => authAccountSchema.parse(account))
}

export async function fetchMySessions(graphqlFetch?: GraphQLFetch): Promise<AuthSession[]> {
  const data = await request({ document: MySessionsDocument, graphqlFetch })
  return data.mySessions.map((session) => authSessionSchema.parse(session))
}

export async function updateProfile(input: UpdateProfileRequest): Promise<AuthUser> {
  const data = await request({ document: UpdateProfileDocument, variables: { input } })
  return authUserSchema.parse(data.updateProfile)
}

export async function changeEmail(input: ChangeEmailRequest) {
  const data = await request({ document: ChangeEmailDocument, variables: { input } })
  return data.changeEmail
}

export async function changePassword(input: ChangePasswordRequest) {
  const data = await request({ document: ChangePasswordDocument, variables: { input } })
  return data.changePassword
}

export async function unlinkAccount(input: UnlinkAccountRequest) {
  const data = await request({ document: UnlinkAccountDocument, variables: { input } })
  return data.unlinkAccount
}

export async function revokeSession(input: RevokeSessionRequest) {
  const data = await request({ document: RevokeSessionDocument, variables: { input } })
  return data.revokeSession
}

export async function revokeOtherSessions() {
  const data = await request({ document: RevokeOtherSessionsDocument })
  return data.revokeOtherSessions
}
