import { builder } from '../../builder'

export const PriorityEnum = builder.enumType('Priority', {
  values: ['low', 'medium', 'high', 'urgent'],
})
