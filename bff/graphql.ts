import { createYoga } from 'graphql-yoga'
import { createContext } from '@/bff/context'
import { schema } from '@/bff/pothos/schema'
import { INTERNAL_SERVER, maskError } from '@/bff/errors'

export function createGraphQLHandler() {
  return createYoga({
    schema,
    graphqlEndpoint: '/api/graphql',
    fetchAPI: { Response },
    context: createContext(),
    maskedErrors: {
      errorMessage: INTERNAL_SERVER.message,
      maskError,
    },
  })
}
