import { SummarizeDayUseCase } from '@/server/modules/insights/use-cases/summarize-day.use-case'
import { InsightsController } from '@/server/modules/insights/controllers/insights.controller'
import type { IInsightsUseCase } from '@/server/modules/insights/use-cases/insights.use-case.interface'
import { aiService } from './infra'

const summarizeDay = new SummarizeDayUseCase(aiService)

const insightsUseCase: IInsightsUseCase = {
  summarizeDay: (todos) => summarizeDay.execute(todos),
}

export const insightsController = new InsightsController(insightsUseCase)
