import { useAsyncData, useRequestHeaders } from '#imports'
import { fetchMySubscription } from './billing.request'
import { billingQueryKeys } from './billing.keys'

export function useMySubscriptionQuery() {
  const requestHeaders = useRequestHeaders(['cookie'])
  return useAsyncData(billingQueryKeys.subscription, () => fetchMySubscription(requestHeaders), {
    server: true,
  })
}
