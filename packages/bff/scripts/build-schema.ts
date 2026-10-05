import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { printSchema } from 'graphql'

import { schema } from '../src/pothos/schema'

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DESTINO = resolve(RAIZ, 'schema.graphql')

writeFileSync(DESTINO, printSchema(schema))
