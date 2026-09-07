import type { suggestTodo } from '@/server/modules/ai/capabilities/suggest-todo'
import type { summarizeDay } from '@/server/modules/ai/capabilities/summarize-day'
import type { nlSearch } from '@/server/modules/ai/capabilities/nl-search'
import type { Todo } from '@/lib/shared/todos/todo.types'
import type { DaySummary, TodoSuggestion } from '@/lib/schemas/ai'
import type { SearchResult } from '@/lib/shared/ai/search'

type AiCapabilities = {
  suggestTodo: typeof suggestTodo
  summarizeDay: typeof summarizeDay
  nlSearch: typeof nlSearch
}

export class AiController {
  constructor(private readonly capabilities: AiCapabilities) {}

  suggestTodo(draft: unknown): Promise<TodoSuggestion> {
    return this.capabilities.suggestTodo(draft)
  }

  summarizeDay(todos: Todo[]): Promise<DaySummary> {
    return this.capabilities.summarizeDay(todos)
  }

  nlSearch(query: string, todos: Todo[]): Promise<SearchResult> {
    return this.capabilities.nlSearch(query, todos)
  }
}
