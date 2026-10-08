import { GraphQLRequestError } from '@ia-task-manager/bff/graphql'
import type { AuthAccount, AuthSession } from '@ia-task-manager/schemas/auth'
import { authQueryKeys } from '$lib/services/auth/auth.keys'
import { fetchMyAccounts, fetchMySessions } from '$lib/services/auth/auth.request'
import type { PageServerLoad } from './$types'

type SettingsData = {
  accounts: AuthAccount[]
  sessions: AuthSession[]
  loadError: string | null
}

export const load: PageServerLoad = async ({ fetch, depends }) => {
  depends(authQueryKeys.accounts)
  depends(authQueryKeys.sessions)

  try {
    const [accounts, sessions] = await Promise.all([fetchMyAccounts(fetch), fetchMySessions(fetch)])
    return { accounts, sessions, loadError: null } as SettingsData
  } catch (cause) {
    console.error('[settings] failed to load accounts/sessions', cause)
    const message =
      cause instanceof GraphQLRequestError
        ? cause.message
        : cause instanceof Error
          ? cause.message
          : 'Não foi possível carregar as configurações.'
    return { accounts: [], sessions: [], loadError: message } as SettingsData
  }
}
