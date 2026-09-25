import { NlSearchUseCase } from '@/server/modules/assistant/use-cases/nl-search.use-case'
import { AssistantController } from '@/server/modules/assistant/controllers/assistant.controller'
import type { IAssistantUseCase } from '@/server/modules/assistant/use-cases/assistant.use-case.interface'
import { aiService } from './infra'

const nlSearch = new NlSearchUseCase(aiService)

const assistantUseCase: IAssistantUseCase = {
  nlSearch: (query, todos) => nlSearch.execute(query, todos),
}

export const assistantController = new AssistantController(assistantUseCase)
