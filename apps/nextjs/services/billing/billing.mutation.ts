import { useMutation } from '@tanstack/react-query'
import { createCheckoutSession, createPortalSession } from './billing.request'
import type { CheckoutSessionRequest } from './billing.types'

export function useCreateCheckoutSessionMutation() {
  return useMutation({
    mutationFn: (input: CheckoutSessionRequest): Promise<string> => createCheckoutSession(input),
  })
}

export function useCreatePortalSessionMutation() {
  return useMutation({ mutationFn: (): Promise<string> => createPortalSession() })
}
