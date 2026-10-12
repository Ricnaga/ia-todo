import type { z } from 'zod'

type JsonSchema = Record<string, unknown>

function unwrap(schema: z.ZodType): z.ZodType {
  const def = schema.def as { type: string; innerType?: z.ZodType; in?: z.ZodType }
  if (def.type === 'optional' || def.type === 'default') {
    return unwrap(def.innerType as z.ZodType)
  }
  if (def.type === 'pipe' || def.type === 'transform') {
    const inner = def.in
    return inner ? unwrap(inner) : schema
  }
  return schema
}

export function toJsonSchema(schema: z.ZodType): JsonSchema {
  const unwrapped = unwrap(schema)
  const def = unwrapped.def as {
    type: string
    shape?: Record<string, z.ZodType>
    entries?: Record<string, string>
    element?: z.ZodType
  }

  switch (def.type) {
    case 'object': {
      const shape = def.shape ?? {}
      const properties: Record<string, JsonSchema> = {}
      const required: string[] = []
      for (const [key, value] of Object.entries(shape)) {
        properties[key] = toJsonSchema(value)
        if (!value.safeParse(undefined).success) required.push(key)
      }

      return {
        type: 'object',
        properties,
        ...(required.length > 0 && { required }),
      }
    }
    case 'string':
      return { type: 'string' }
    case 'enum': {
      const entries = def.entries
      if (!entries) throw new Error('toJsonSchema: ZodEnum sem values')
      return { type: 'string', enum: Object.values(entries) }
    }
    case 'array': {
      const element = def.element
      if (!element) throw new Error('toJsonSchema: ZodArray sem type')
      return { type: 'array', items: toJsonSchema(element) }
    }
    default:
      throw new Error(`toJsonSchema: tipo zod não suportado no mapper Gemini: ${def.type}`)
  }
}
