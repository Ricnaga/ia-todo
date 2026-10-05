import { firstGraphQLError } from '@ia-task-manager/bff/graphql'
import { print } from 'graphql'
import type { RequestOptions } from './graphql.types'

export const UNAUTHENTICATED_CODE = 'UNAUTHENTICATED'

export class GraphQLRequestError extends Error {
  readonly code: string | undefined

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'GraphQLRequestError'
    this.code = code
  }
}

/**
 * Envia um documento GraphQL e devolve o `data` ja tipado.
 *
 * `document` e um `Document<TResult, TVariables>` gerado pelo codegen, e nao uma
 * string: os dois genéricos sao inferidos do documento, entao a chamada fica
 * `request({ document: ListTodosDocument })` -- sem `<T>` explicito, sem `any` e
 * sem o `Record<never, never>` que antes proibia passar variaveis.
 *
 * `graphqlFetch` e o `fetch` que o load recebeu: e ele que herda cookie e
 * authorization no SSR. Sem ele, `fetch` puro no servidor chamaria a propria
 * URL publica e perderia a sessao.
 *
 * O Yoga responde `200` mesmo em erro de resolucao, com o erro dentro de
 * `errors` -- por isso o envelope e lido antes do `data`. O `errors` nao e
 * acreditado: o Zod em `firstGraphQLError` o valida.
 *
 * O `as` abaixo e a unica assertion do data layer, e ela e insubstituivel por
 * construcao: `response.json()` devolve `any`, e nenhum schema Zod consegue
 * validar um `TResult` arbitrario, porque o tipo vem do codegen e nao existe em
 * tempo de execucao. Estreitar `data` para `TResult` exigiria um `as` de
 * qualquer jeito; a alternativa seria devolver `unknown` e perder a tipagem que
 * o codegen comprou. A forma do payload e conferida no passo seguinte, pelo Zod
 * da camada de request (`todoSchema.parse` e companhia).
 *
 * `print` e necessario porque este app monta o body na mao. E ele que anexa ao
 * corpo a definicao dos fragmentos, que o documento gerado ja traz embutida.
 */
export async function request<TResult, TVariables>({
  document,
  variables,
  graphqlFetch = fetch,
}: RequestOptions<TResult, TVariables>): Promise<TResult> {
  const response = await graphqlFetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: print(document), variables }),
  })

  const payload = (await response.json()) as { data?: TResult; errors?: unknown }

  const failure = firstGraphQLError(payload)
  if (failure) throw new GraphQLRequestError(failure.message, failure.extensions?.code)
  if (!payload.data) throw new GraphQLRequestError('Resposta do GraphQL sem campo data.')

  return payload.data
}
