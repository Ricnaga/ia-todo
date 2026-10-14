import { createMutation } from '$lib/utils/mutation.svelte'
import { createCheckoutSession, createPortalSession } from './billing.request'
import type { CheckoutSessionRequest } from './billing.types'

export function useCreateCheckoutSessionMutation() {
  return createMutation({
    mutationFn: (input: CheckoutSessionRequest): Promise<string> => createCheckoutSession(input),
  })
}

export function useCreatePortalSessionMutation() {
  return createMutation({
    mutationFn: (): Promise<string> => createPortalSession(),
  })
}
