import { firstGraphQLError } from '@ia-task-manager/bff/graphql'
import { print } from 'graphql'
import type { RequestOptions } from './graphql.types'

export const UNAUTHENTICATED_CODE = 'UNAUTHENTICATED'

/**
 * `errors` e `unknown` de proposito: e o que o corpo da resposta e antes de
 * alguem olhar, e quem le e o Zod em `firstGraphQLError`. O `data` vem da
 * assinatura do documento gerado, e a forma dele e conferida pelo Zod na camada
 * de request (`todoSchema.parse` e companhia), um passo acima daqui.
 */
type GraphQLResponse<TData> = {
  data?: TData
  errors?: unknown
}

export class GraphQLRequestError extends Error {
  readonly code: string | undefined

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'GraphQLRequestError'
    this.code = code
  }
}

/**
 * O Yoga responde `200` mesmo em erro de resolucao, com o erro dentro de
 * `errors`. Por isso o `errors` e verificado aqui: um erro de GraphQL nao chega
 * como excecao do `$fetch`, e sem esta checagem ele viraria `undefined`
 * silencioso na tela.
 *
 * `requestHeaders` existe para o prefetch no SSR: o `$fetch` com URL relativa
 * roda dentro do Nitro e nao herda o cookie da request original, entao quem
 * chama passa `useRequestHeaders(['cookie'])`.
 *
 * `print` e necessario porque este app monta o body na mao, ao contrario do Next,
 * que delega o `print` ao `graphql-request`. E ele e o que anexa ao corpo a
 * definicao dos fragmentos: o documento gerado ja a traz embutida.
 */
export async function request<TResult, TVariables>({
  document,
  variables,
  headers: requestHeaders,
}: RequestOptions<TResult, TVariables>): Promise<TResult> {
  const response = await $fetch<GraphQLResponse<TResult>>('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...requestHeaders },
    body: { query: print(document), variables },
  })

  const failure = firstGraphQLError(response)
  if (failure) throw new GraphQLRequestError(failure.message, failure.extensions?.code)
  if (!response.data) throw new GraphQLRequestError('Resposta do GraphQL sem campo data.')

  return response.data
}
