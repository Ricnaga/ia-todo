import type { IAssistantUseCase } from '@/server/modules/assistant/use-cases/assistant.use-case.interface'
import type { Todo } from '@/lib/schemas/todo'
import type { Assistant } from '@/lib/schemas/assistant'

export class AssistantController {
  constructor(private readonly assistantUseCase: IAssistantUseCase) {}

  nlSearch(query: string, todos: Todo[]): Promise<Assistant> {
    return this.assistantUseCase.nlSearch(query, todos)
  }
}
