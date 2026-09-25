import type { IInsightsUseCase } from '@/server/modules/insights/use-cases/insights.use-case.interface'
import type { Todo } from '@/lib/schemas/todo'
import type { DaySummary } from '@/lib/schemas/insights'

export class InsightsController {
  constructor(private readonly insightsUseCase: IInsightsUseCase) {}

  summarizeDay(todos: Todo[]): Promise<DaySummary> {
    return this.insightsUseCase.summarizeDay(todos)
  }
}
