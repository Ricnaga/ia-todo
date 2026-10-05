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
  // Habilita `defaultFieldNullability` no objeto de opcoes. O Pothos le esse
  // parametro do par de tipos para decidir se a opcao existe; sem ele, o
  // `SchemaBuilderOptions` tipa o campo como `never` e a opcao -- que o runtime
  // ate aceitaria -- e recusada pelo compilador.
  //
  // Com `false`, a nulabilidade de cada campo e inferida do tipo do TS
  // (`objectRef<Todo>` vem de `z.infer`) em vez de ser nullable por padrao. O
  // SDL dizia `id: String` para um campo que o dominio garante como `z.string()`,
  // o que deixava o contrato GraphQL mais frouxo que o Zod e fazia o codegen do
  // cliente gerar `id: string | null` -- a tipagem forte so aparecia depois do
  // parse. `description` e `dueDate`, que sao `string | null` no dominio,
  // continuam declarados com `nullable: true` explicito nos `.ref.ts`.
  DefaultFieldNullability: false
  Scalars: {
    DateTime: {
      Input: Date
      Output: Date
    }
  }
}>({
  defaultFieldNullability: false,
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
        // `charAt` e nao `fieldName[0]`: com `noUncheckedIndexedAccess` ligado
        // (o tsconfig gerado pelo Nuxt liga) o indexamento devolve
        // `string | undefined` e o typecheck do app passa a acusar o BFF, que
        // tem o proprio tsconfig sem a flag.
        const capitalized = `${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`
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
