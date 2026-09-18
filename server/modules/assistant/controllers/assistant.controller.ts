import type { NlSearchUseCase } from '@/server/modules/assistant/use-cases/nl-search.use-case'
import type { Todo } from '@/lib/schemas/todo'
import type { Assistant } from '@/lib/schemas/assistant'

export class AssistantController {
  constructor(private readonly useCases: { nlSearch: NlSearchUseCase }) {}

  nlSearch(query: string, todos: Todo[]): Promise<Assistant> {
    return this.useCases.nlSearch.execute(query, todos)
  }
}
