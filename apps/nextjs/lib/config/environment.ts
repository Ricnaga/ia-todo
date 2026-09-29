import 'server-only'

import { z } from 'zod'

/**
 * O Next le `process.env` em qualquer lugar e nao falha quando a variavel
 * falta: o erro apareceria tarde, como um warning de metadataRelativeUrl no
 * meio do render, sem dizer qual variavel e o problema. Aqui a leitura acontece
 * uma vez, na primeira avaliacao deste modulo, e o erro sai com a lista do que
 * falhou.
 *
 * `import 'server-only'` porque este arquivo le env de servidor: o `APP_ORIGIN`
 * nao pode acabar no bundle do browser junto com o layout.
 *
 * O escopo e do app, nao do dominio: o que o BFF e o `packages/server`
 * exigem para funcionar (banco, auth, Redis) continua validado em
 * `packages/server/src/config/environment.ts`.
 */
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
