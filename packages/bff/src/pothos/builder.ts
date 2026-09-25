import SchemaBuilder from '@pothos/core'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import WithInputPlugin from '@pothos/plugin-with-input'
import { GraphQLError } from 'graphql'
import type { GraphQLContext } from '../context'
import type { AuthUser } from '@ia-task-manager/schemas/auth'

type LoggedInContext = GraphQLContext & { user: AuthUser }

export const builder = new SchemaBuilder<{
  Context: GraphQLContext
  AuthScopes: { loggedIn: boolean }
  AuthContexts: { loggedIn: LoggedInContext }
  Scalars: {
    DateTime: {
      Input: Date
      Output: Date
    }
  }
}>({
  plugins: [ScopeAuthPlugin, WithInputPlugin],
  scopeAuth: {
    authScopes: (ctx) => ({
      loggedIn: ctx.user !== null,
    }),
    unauthorizedError: () =>
      new GraphQLError('Você precisa estar autenticado para realizar esta operação', {
        extensions: { code: 'UNAUTHENTICATED' },
      }),
  },
  withInput: {
    typeOptions: {
      name: ({ parentTypeName, fieldName }) => {
        const capitalized = `${fieldName[0].toUpperCase()}${fieldName.slice(1)}`
        if (parentTypeName === 'Query' || parentTypeName === 'Mutation') {
          return `${capitalized}Input`
        }
        return `${parentTypeName}${capitalized}Input`
      },
    },
  },
})

builder.queryType({
  authScopes: { loggedIn: true },
})
builder.mutationType({
  authScopes: { loggedIn: true },
})
