import type { Todo } from '@ia-task-manager/schemas/todo'
import type { Assistant } from '@ia-task-manager/schemas/assistant'

export interface IAssistantUseCase {
  nlSearch(query: string, todos: Todo[]): Promise<Assistant>
}
