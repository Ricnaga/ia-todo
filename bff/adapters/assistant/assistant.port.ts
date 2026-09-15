import type { Todo } from '@/lib/shared/todos/todo.types'
import type { SearchResult } from '@/lib/shared/ai/search'

export interface AssistantPort {
  nlSearch(query: string, todos: Todo[]): Promise<SearchResult>
}
