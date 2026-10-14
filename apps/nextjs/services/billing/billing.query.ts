import { useSuspenseQuery } from '@tanstack/react-query'
import { fetchMySubscription } from './billing.request'
import { billingQueryKeys } from './billing.keys'

export function useMySubscriptionQuery() {
  return useSuspenseQuery({
    queryKey: billingQueryKeys.subscription,
    queryFn: () => fetchMySubscription(),
  })
}
