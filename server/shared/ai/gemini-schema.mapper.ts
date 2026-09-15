import { SchemaType, type Schema } from '@google/generative-ai'
import type { z } from 'zod'

function unwrap(schema: z.ZodType): z.ZodType {
  const def = schema._def as { typeName?: string; innerType?: z.ZodType; schema?: z.ZodType }
  if (def.typeName === 'ZodOptional' || def.typeName === 'ZodDefault') {
    return unwrap(def.innerType as z.ZodType)
  }
  if (def.typeName === 'ZodEffects') {
    return unwrap(def.schema as z.ZodType)
  }
  return schema
}

function isOptional(schema: z.ZodType): boolean {
  const typeName = (schema._def as { typeName?: string }).typeName
  return typeName === 'ZodOptional' || typeName === 'ZodDefault'
}

export function toGeminiSchema(schema: z.ZodType): Schema {
  const unwrapped = unwrap(schema)
  const def = unwrapped._def as unknown as {
    typeName: string
    shape?: () => Record<string, z.ZodType>
    values?: readonly [string, ...string[]]
    type?: z.ZodType
  }

  switch (def.typeName) {
    case 'ZodObject': {
      const shape = def.shape?.()
      if (!shape) throw new Error('toSchema: ZodObject sem shape')

      const properties: Record<string, Schema> = {}
      const required: string[] = []
      for (const [key, value] of Object.entries(shape)) {
        properties[key] = toGeminiSchema(value)
        if (!isOptional(value)) required.push(key)
      }

      return {
        type: SchemaType.OBJECT,
        properties,
        ...(required.length > 0 && { required }),
      }
    }
    case 'ZodString':
      return { type: SchemaType.STRING }
    case 'ZodEnum': {
      const values = def.values
      if (!values) throw new Error('toSchema: ZodEnum sem values')
      return { type: SchemaType.STRING, format: 'enum', enum: [...values] }
    }
    case 'ZodArray': {
      const type = def.type
      if (!type) throw new Error('toSchema: ZodArray sem type')
      return { type: SchemaType.ARRAY, items: toGeminiSchema(type) }
    }
    default:
      throw new Error(`toSchema: tipo zod não suportado no mapper Gemini: ${def.typeName}`)
  }
}
