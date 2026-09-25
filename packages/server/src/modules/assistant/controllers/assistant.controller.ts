import type { IAssistantUseCase } from '../use-cases/assistant.use-case.interface'
import type { Todo } from '@ia-task-manager/schemas/todo'
import type { Assistant } from '@ia-task-manager/schemas/assistant'

export class AssistantController {
  constructor(private readonly assistantUseCase: IAssistantUseCase) {}

  nlSearch(query: string, todos: Todo[]): Promise<Assistant> {
    return this.assistantUseCase.nlSearch(query, todos)
  }
}
