import type { Todo } from '@/lib/schemas/todo'
import type { SearchResult } from '@/lib/shared/assistant/search'

export interface AssistantPort {
  nlSearch(query: string, todos: Todo[]): Promise<SearchResult>
}
