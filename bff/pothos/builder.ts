import SchemaBuilder from '@pothos/core'
import type { GraphQLContext } from '@/bff/context'

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
