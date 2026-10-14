import { request } from '@/services/graphql/base'
import type { RequestHeaders } from '@/services/graphql/graphql.types'
import {
  CreateCheckoutSessionDocument,
  CreatePortalSessionDocument,
  MySubscriptionDocument,
} from '@ia-task-manager/bff/graphql'
import { subscriptionSchema, type Subscription } from '@ia-task-manager/schemas/billing'
import type { CheckoutSessionRequest } from './billing.types'

export async function fetchMySubscription(headers?: RequestHeaders): Promise<Subscription> {
  const data = await request({ document: MySubscriptionDocument, headers })
  return subscriptionSchema.parse(data.mySubscription)
}

export async function createCheckoutSession(input: CheckoutSessionRequest): Promise<string> {
  const data = await request({ document: CreateCheckoutSessionDocument, variables: { input } })
  return data.createCheckoutSession
}

export async function createPortalSession(): Promise<string> {
  const data = await request({ document: CreatePortalSessionDocument })
  return data.createPortalSession
}
