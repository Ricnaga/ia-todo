import { builder } from '@/bff/pothos/builder'

export const PriorityEnum = builder.enumType('Priority', {
  values: ['low', 'medium', 'high', 'urgent'],
})
