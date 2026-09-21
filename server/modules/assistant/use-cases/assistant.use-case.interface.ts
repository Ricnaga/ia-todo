import type { Todo } from '@/lib/schemas/todo'
import type { Assistant } from '@/lib/schemas/assistant'

export interface IAssistantUseCase {
  nlSearch(query: string, todos: Todo[]): Promise<Assistant>
}
