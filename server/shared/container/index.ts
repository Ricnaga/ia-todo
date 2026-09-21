export { todoController } from './todo'
export { assistantController } from './assistant'
import { SummarizeDayUseCase } from '@/server/modules/insights/use-cases/summarize-day.use-case'
import { InsightsController } from '@/server/modules/insights/controllers/insights.controller'
import { aiService } from './infra'

const summarizeDay = new SummarizeDayUseCase(aiService)

export const insightsController = new InsightsController({
  summarizeDay,
})
