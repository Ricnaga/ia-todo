import type { NlSearchUseCase } from '@/server/modules/assistant/use-cases/nl-search.use-case'
import type { Todo } from '@/lib/schemas/todo'
import type { SearchResult } from '@/lib/shared/assistant/search'

export class AssistantController {
  constructor(private readonly useCases: { nlSearch: NlSearchUseCase }) {}

  nlSearch(query: string, todos: Todo[]): Promise<SearchResult> {
    return this.useCases.nlSearch.execute(query, todos)
  }
}
