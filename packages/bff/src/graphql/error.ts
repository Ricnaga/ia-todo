import { z } from 'zod'

/**
 * Envelope de erro do GraphQL, o mesmo nos tres apps.
 *
 * Vive no pacote de contrato e nao em cada `base.ts` porque os tres leem a mesma
 * resposta do Yoga. Se um app aceitar um envelope diferente dos outros, o
 * `use-session-guard` -- que e compartilhado -- passa a se comportar diferente
 * conforme o app, e o bug so aparece no app que mudou.
 *
 * `code` e opcional dentro de `extensions` de proposito. O Yoga sempre manda
 * `extensions` quando o erro vem do resolutor (e o `scopeAuth` do Pothos e quem
 * preenche `UNAUTHENTICATED`), mas um erro de GraphQL puro chega sem
 * `extensions`. Com `code` obrigatorio, o envelope inteiro seria recusado e o
 * que se guardaria seria a ausencia do erro, nao a mensagem.
 */
export const graphQLErrorSchema = z.object({
  message: z.string(),
  extensions: z.object({ code: z.string().optional() }).optional(),
})

export type GraphQLErrorPayload = z.infer<typeof graphQLErrorSchema>

const errorEnvelopeSchema = z.object({
  errors: z.array(graphQLErrorSchema).min(1),
})

/**
 * Extrai o primeiro erro de um corpo de resposta desconhecido, ou `undefined`
 * quando a resposta nao tem envelope de erro.
 *
 * E o Zod que estreita: o parametro e `unknown` porque e isso que o corpo de
 * uma resposta HTTP e antes de alguem olhar, e o `safeParse` devolve um tipo
 * concreto ou falha. Nao ha `as` aqui -- o envelope que chega e lido, nao
 * acreditado, que era o que o `as GraphQLResponse<TResult>` fazia no SvelteKit.
 */
export function firstGraphQLError(body: unknown): GraphQLErrorPayload | undefined {
  const parsed = errorEnvelopeSchema.safeParse(body)
  return parsed.success ? parsed.data.errors[0] : undefined
}
