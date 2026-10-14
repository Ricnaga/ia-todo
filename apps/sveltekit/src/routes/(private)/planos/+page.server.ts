import { GraphQLRequestError } from '@ia-task-manager/bff/graphql'
import { billingQueryKeys } from '$lib/services/billing/billing.keys'
import { fetchMySubscription } from '$lib/services/billing/billing.request'
import type { Subscription } from '@ia-task-manager/schemas/billing'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, depends }) => {
  depends(billingQueryKeys.subscription)

  try {
    const subscription = await fetchMySubscription(fetch)
    return { subscription, loadError: null } as {
      subscription: Subscription
      loadError: string | null
    }
  } catch (cause) {
    console.error('[planos] failed to load subscription', cause)
    const message =
      cause instanceof GraphQLRequestError
        ? cause.message
        : cause instanceof Error
          ? cause.message
          : 'Não foi possível carregar seu plano.'
    return { subscription: null, loadError: message } as {
      subscription: Subscription | null
      loadError: string | null
    }
  }
}
