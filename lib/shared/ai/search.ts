import type { SearchCriteria } from '@/lib/schemas/ai'
import type { Todo } from '@/lib/shared/todos/todo.types'

export type SearchResult = {
  criteria: SearchCriteria
  results: Todo[]
}
