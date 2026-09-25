import { builder } from '../builder'
import { Kind } from 'graphql'

export const DateTimeScalar = builder.scalarType('DateTime', {
  serialize: (value) => (value instanceof Date ? value.toISOString() : String(value)),
  parseValue: (value) => new Date(String(value)),
  parseLiteral: (value) => (value.kind === Kind.STRING ? new Date(value.value) : null),
})
