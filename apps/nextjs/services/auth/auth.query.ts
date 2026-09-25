import { useSuspenseQuery } from '@tanstack/react-query'
import type { AuthUser } from '@ia-task-manager/schemas/auth'
import { fetchMe, fetchMyAccounts, fetchMySessions } from './auth.request'
import { authQueryKeys } from './auth.keys'

export type AuthUserResult = AuthUser | null

export function useMeQuery() {
  return useSuspenseQuery({
    queryKey: authQueryKeys.me,
    queryFn: () => fetchMe(),
  })
}

export function useMyAccountsQuery() {
  return useSuspenseQuery({
    queryKey: authQueryKeys.accounts,
    queryFn: () => fetchMyAccounts(),
  })
}

export function useMySessionsQuery() {
  return useSuspenseQuery({
    queryKey: authQueryKeys.sessions,
    queryFn: () => fetchMySessions(),
  })
}
