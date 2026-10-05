import { createYoga } from 'graphql-yoga'
import { createContext } from './context'
import { schema } from './pothos/schema'
import { INTERNAL_SERVER, maskError } from './errors'

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
