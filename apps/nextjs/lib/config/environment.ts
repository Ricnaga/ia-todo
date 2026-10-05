import 'server-only'

import { z } from 'zod'

const envSchema = z.object({
  APP_ORIGIN: z.url().default('http://localhost:3000'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const invalid = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')
  throw new Error(`Variáveis de ambiente inválidas ou ausentes: ${invalid}`)
}

export const env = parsed.data

export type Env = typeof env
