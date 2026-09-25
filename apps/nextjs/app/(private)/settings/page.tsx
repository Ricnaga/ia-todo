import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth/session'
import { authQueryKeys } from '@/services/auth/auth.keys'
import { fetchMyAccounts, fetchMySessions } from '@/services/auth/auth.request'
import { SettingsPanel } from './_components/settings-panel'

export default async function SettingsPage() {
  const user = await verifySession()
  const cookieStore = await cookies()
  const requestHeaders = { cookie: cookieStore.toString() }

  const queryClient = new QueryClient()
  await Promise.all([
    queryClient
      .query({
        queryKey: authQueryKeys.accounts,
        queryFn: () => fetchMyAccounts(requestHeaders),
        staleTime: 5_000,
      })
      .catch(() => undefined),
    queryClient
      .query({
        queryKey: authQueryKeys.sessions,
        queryFn: () => fetchMySessions(requestHeaders),
        staleTime: 5_000,
      })
      .catch(() => undefined),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SettingsPanel user={user} />
    </HydrationBoundary>
  )
}
