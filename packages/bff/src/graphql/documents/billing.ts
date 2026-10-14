import { graphql } from '../generated/gql'

export const MySubscriptionSource = graphql(`
  query MySubscription {
    mySubscription {
      plan
      status
      currentPeriodEnd
      cancelAtPeriodEnd
    }
  }
`)

export const CreateCheckoutSessionSource = graphql(`
  mutation CreateCheckoutSession($input: CreateCheckoutSessionInput!) {
    createCheckoutSession(input: $input)
  }
`)

export const CreatePortalSessionSource = graphql(`
  mutation CreatePortalSession {
    createPortalSession
  }
`)
