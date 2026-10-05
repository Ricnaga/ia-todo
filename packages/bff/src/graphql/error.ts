import { z } from 'zod'

export const graphQLErrorSchema = z.object({
  message: z.string(),
  extensions: z.object({ code: z.string().optional() }).optional(),
})

export type GraphQLErrorPayload = z.infer<typeof graphQLErrorSchema>

const errorEnvelopeSchema = z.object({
  errors: z.array(graphQLErrorSchema).min(1),
})

export function firstGraphQLError(body: unknown): GraphQLErrorPayload | undefined {
  const parsed = errorEnvelopeSchema.safeParse(body)
  return parsed.success ? parsed.data.errors[0] : undefined
}
