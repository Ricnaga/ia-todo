import { builder } from '@/bff/pothos/builder'

export const SearchStatusEnum = builder.enumType('SearchStatus', {
  values: ['any', 'pending', 'completed'],
})

export const SearchPriorityEnum = builder.enumType('SearchPriority', {
  values: ['any', 'low', 'medium', 'high', 'urgent'],
})

export const SearchDueEnum = builder.enumType('SearchDue', {
  values: ['any', 'today', 'thisWeek', 'overdue', 'none'],
})
