import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import type { ReactNode } from 'react'
import { verifySession } from '@/lib/auth/session'
import { NavShell } from '@/components/nav-shell'
import { authQueryKeys } from '@/services/auth/auth.keys'
import { fetchMe } from '@/services/auth/auth.request'
import { SessionGuard } from './_components/session-guard/session-guard'

type AppLayoutProps = {
  children: ReactNode
}

export default async function AppLayout({ children }: AppLayoutProps) {
  await verifySession()
  const cookieStore = await cookies()
  const requestHeaders = { cookie: cookieStore.toString() }

  const queryClient = new QueryClient()
  await queryClient.query({
    queryKey: authQueryKeys.me,
    queryFn: () => fetchMe(requestHeaders),
    staleTime: 0,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SessionGuard />
      <NavShell>{children}</NavShell>
    </HydrationBoundary>
  )
}
