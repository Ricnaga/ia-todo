import { useMutation } from '~/composables/useMutation'
import { createCheckoutSession, createPortalSession } from './billing.request'
import type { CheckoutSessionRequest } from './billing.types'

export function useCreateCheckoutSessionMutation() {
  return useMutation({
    mutationFn: (input: CheckoutSessionRequest) => createCheckoutSession(input),
  })
}

export function useCreatePortalSessionMutation() {
  return useMutation({
    mutationFn: () => createPortalSession(),
  })
}
