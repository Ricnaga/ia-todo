export { todoController } from './todo'
import { NlSearchUseCase } from '@/server/modules/assistant/use-cases/nl-search.use-case'
import { AssistantController } from '@/server/modules/assistant/controllers/assistant.controller'
import { SummarizeDayUseCase } from '@/server/modules/insights/use-cases/summarize-day.use-case'
import { InsightsController } from '@/server/modules/insights/controllers/insights.controller'
import { aiService } from './infra'

const nlSearch = new NlSearchUseCase(aiService)

export const assistantController = new AssistantController({
  nlSearch,
})

const summarizeDay = new SummarizeDayUseCase(aiService)

export const insightsController = new InsightsController({
  summarizeDay,
})
