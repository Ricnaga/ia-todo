import type { Document } from '@ia-task-manager/bff/graphql'

export type RequestHeaders = Record<string, string>

/**
 * Argumentos do `request` de `base.ts`, em um objeto nomeado.
 *
 * A forma anterior (`document, variables?, requestHeaders?`) obrigava a toda
 * chamada que precisava so do terceiro a passar `undefined` na segunda posicao --
 * `request(ListTodosDocument, undefined, requestHeaders)`. O `undefined` e
 * obrigatorio so para chegar no terceiro argumento, entao ele nao carregava
 * informacao nenhuma, e a diferenca entre `request(Document)` e
 * `request(Document, undefined, requestHeaders)` ficava na posicao, nao no nome.
 *
 * Os nomes `document`/`variables`/`headers` tambem vem do `graphql-request`, que
 * aceita exatamente este objeto, entao a forma nao e uma traducao: e a mesma que o
 * cliente ja usa internamente.
 */
export type RequestOptions<TResult, TVariables> = {
  document: Document<TResult, TVariables>
  variables?: TVariables
  headers?: RequestHeaders
}
