import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { printSchema } from 'graphql'

import { schema } from '../src/pothos/schema'

/**
 * Gera `schema.graphql` a partir do schema Pothos.
 *
 * Existe um passo separado em vez de `printSchema` dentro do `codegen.ts` por
 * causa de um conflito de modulo: o codegen carrega o config com o jiti, que
 * puxa `graphql` como CommonJS enquanto o Pothos entra como ESM. Sao duas
 * instancias da mesma biblioteca, e o `isObjectType` do `printSchema` -- que
 * depende de `instanceof` -- passa a dar `false` para todo tipo, estourando
 * `Unexpected type: Assistant`. Sob `tsx` nao ha esse problema, e este e o
 * mesmo loader que o Yoga usa em producao.
 *
 * O arquivo gerado e commitado por dois motivos: o codegen precisa dele, e o
 * GraphQLSP (plugin de editor) valida os documentos contra ele. Ele nunca fica
 * velho de um jeito que importe, porque `pnpm codegen` roda este script antes do
 * codegen -- um SDL desatualizado nunca chega a ser usado.
 */
const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DESTINO = resolve(RAIZ, 'schema.graphql')

writeFileSync(DESTINO, printSchema(schema))
