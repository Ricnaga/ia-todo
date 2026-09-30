import { sendWebResponse, toWebRequest } from 'h3'
import { yoga } from '../utils/graphql'

/**
 * O Yoga e um fetch handler `(Request) => Response`, e nao um `WebHandler` do
 * h3 (que seria `(Request, NodeResponse) => void`): por isso nao da para usar
 * `fromWebHandler`, cujo segundo parametro o TypeScript nao aceita. O par
 * `toWebRequest` + `sendWebResponse` faz a traducao manual -- `toWebRequest`
 * monta o `Request` web a partir do evento do h3 (sem `body` em GET/HEAD, o
 * que deixa o GraphiQL funcionar) e `sendWebResponse` devolve o `Response` do
 * Yoga preservando status, headers e `set-cookie`.
 *
 * O arquivo cobre GET (GraphiQL) e POST (API); o proprio Yoga rejeita o que
 * ele nao aceita.
 */
export default defineEventHandler(async (event) => {
  return sendWebResponse(event, await yoga(toWebRequest(event)))
})
