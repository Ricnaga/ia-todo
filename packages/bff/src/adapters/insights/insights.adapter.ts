import type { InsightsController } from '@ia-task-manager/server'
import type { InsightsPort } from './insights.port'

export function insightsAdapter(controller: InsightsController): InsightsPort {
  return {
    summarizeDay: (todos) => controller.summarizeDay(todos),
  }
}
