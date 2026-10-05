import type { Document } from '@ia-task-manager/bff/graphql'

export type GraphQLFetch = typeof fetch

/**
 * Argumentos do `request` de `base.ts`, em um objeto nomeado.
 *
 * A forma anterior (`document, variables?, graphqlFetch?`) obrigava a passar
 * `undefined` na segunda posicao so para chegar no `fetch`, e `fetch` era a
 * unica chamada legitima da arvore de load -- todas as outras queriam o default.
 * Nomeado, o `undefined` some e o que a chamada faz fica no nome do campo.
 *
 * `graphqlFetch` e opcional porque o `request` cai em `fetch` quando ele nao vem.
 */
export type RequestOptions<TResult, TVariables> = {
  document: Document<TResult, TVariables>
  variables?: TVariables
  graphqlFetch?: GraphQLFetch
}
