import type { SearchCriteria } from '@/lib/schemas/assistant'
import type { Todo } from '@/lib/schemas/todo'

export type SearchResult = {
  criteria: SearchCriteria
  results: Todo[]
}
