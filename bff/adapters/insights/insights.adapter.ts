import type { InsightsController } from '@/server/modules/insights/controllers/insights.controller'
import type { InsightsPort } from './insights.port'

export function insightsAdapter(controller: InsightsController): InsightsPort {
  return {
    summarizeDay: (todos) => controller.summarizeDay(todos),
  }
}
