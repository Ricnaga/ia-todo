import SchemaBuilder from '@pothos/core'
import type { GraphQLContext } from '@/bff/context'
import { Kind } from 'graphql'

export const builder = new SchemaBuilder<{
  Context: GraphQLContext
  Scalars: {
    DateTime: {
      Input: Date
      Output: Date
    }
  }
}>({})

builder.queryType({})
builder.mutationType({})

export const PriorityEnum = builder.enumType('Priority', {
  values: ['low', 'medium', 'high', 'urgent'],
})

export const DateTimeScalar = builder.scalarType('DateTime', {
  serialize: (value) => (value instanceof Date ? value.toISOString() : String(value)),
  parseValue: (value) => new Date(String(value)),
  parseLiteral: (value) => (value.kind === Kind.STRING ? new Date(value.value) : null),
})
