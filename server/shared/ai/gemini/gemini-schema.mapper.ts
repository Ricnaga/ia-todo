import { SchemaType, type Schema } from '@google/generative-ai'
import type { z } from 'zod'

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

export function toGeminiSchema(schema: z.ZodType): Schema {
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
      const properties: Record<string, Schema> = {}
      const required: string[] = []
      for (const [key, value] of Object.entries(shape)) {
        properties[key] = toGeminiSchema(value)
        if (!value.isOptional()) required.push(key)
      }

      return {
        type: SchemaType.OBJECT,
        properties,
        ...(required.length > 0 && { required }),
      }
    }
    case 'string':
      return { type: SchemaType.STRING }
    case 'enum': {
      const entries = def.entries
      if (!entries) throw new Error('toSchema: ZodEnum sem values')
      return { type: SchemaType.STRING, format: 'enum', enum: Object.values(entries) }
    }
    case 'array': {
      const element = def.element
      if (!element) throw new Error('toSchema: ZodArray sem type')
      return { type: SchemaType.ARRAY, items: toGeminiSchema(element) }
    }
    default:
      throw new Error(`toSchema: tipo zod não suportado no mapper Gemini: ${def.type}`)
  }
}
