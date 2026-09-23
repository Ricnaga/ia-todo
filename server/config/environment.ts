import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().min(1).default('gemini-2.5-flash'),
  BETTER_AUTH_URL: z.string().url().default('http://localhost:3000'),
  BETTER_AUTH_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  REDIS_URL: z.url().default('redis://localhost:6379'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const missing = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')
  throw new Error(`Variáveis de ambiente inválidas ou ausentes: ${missing}`)
}

export const env = parsed.data

export type Env = typeof env
