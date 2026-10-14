import { NlSearchUseCase } from '../../modules/assistant/use-cases/nl-search.use-case'
import { AssistantController } from '../../modules/assistant/controllers/assistant.controller'
import type { IAssistantUseCase } from '../../modules/assistant/use-cases/assistant.use-case.interface'
import { aiService } from './infra'
import { entitlementsService } from './billing'

const nlSearch = new NlSearchUseCase(aiService, entitlementsService)

const assistantUseCase: IAssistantUseCase = {
  nlSearch: (query, todos, userId) => nlSearch.execute(query, todos, userId),
}

export const assistantController = new AssistantController(assistantUseCase)
