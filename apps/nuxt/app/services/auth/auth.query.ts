import { useAsyncData, useRequestHeaders } from '#imports'
import { fetchMe, fetchMyAccounts, fetchMySessions } from './auth.request'
import { authQueryKeys } from './auth.keys'

export function useMeQuery() {
  const requestHeaders = useRequestHeaders(['cookie'])
  return useAsyncData(authQueryKeys.me, () => fetchMe(requestHeaders), {
    server: true,
  })
}

export function useMyAccountsQuery() {
  const requestHeaders = useRequestHeaders(['cookie'])
  return useAsyncData(authQueryKeys.accounts, () => fetchMyAccounts(requestHeaders), {
    server: true,
  })
}

export function useMySessionsQuery() {
  const requestHeaders = useRequestHeaders(['cookie'])
  return useAsyncData(authQueryKeys.sessions, () => fetchMySessions(requestHeaders), {
    server: true,
  })
}
