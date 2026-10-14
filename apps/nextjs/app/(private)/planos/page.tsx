import { Suspense } from 'react'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import { SkeletonStack } from '@/components/skeleton-stack/skeleton-stack'
import { billingQueryKeys } from '@/services/billing/billing.keys'
import { fetchMySubscription } from '@/services/billing/billing.request'
import { PlanManager } from './_components/plan-manager/plan-manager'

export default async function PlanosPage() {
  const cookieStore = await cookies()
  const requestHeaders = { cookie: cookieStore.toString() }

  const queryClient = new QueryClient()
  await queryClient
    .query({
      queryKey: billingQueryKeys.subscription,
      queryFn: () => fetchMySubscription(requestHeaders),
      staleTime: 5_000,
    })
    .catch(() => undefined)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<SkeletonStack lines={6} rowHeight={24} />}>
        <PlanManager />
      </Suspense>
    </HydrationBoundary>
  )
}
