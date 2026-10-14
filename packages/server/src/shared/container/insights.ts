import { SummarizeDayUseCase } from '../../modules/insights/use-cases/summarize-day.use-case'
import { InsightsController } from '../../modules/insights/controllers/insights.controller'
import type { IInsightsUseCase } from '../../modules/insights/use-cases/insights.use-case.interface'
import { aiService } from './infra'
import { entitlementsService } from './billing'

const summarizeDay = new SummarizeDayUseCase(aiService, entitlementsService)

const insightsUseCase: IInsightsUseCase = {
  summarizeDay: (todos, userId) => summarizeDay.execute(todos, userId),
}

export const insightsController = new InsightsController(insightsUseCase)
