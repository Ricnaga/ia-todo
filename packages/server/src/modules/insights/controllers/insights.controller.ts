import type { IInsightsUseCase } from '../use-cases/insights.use-case.interface'
import type { Todo } from '@ia-task-manager/schemas/todo'
import type { DaySummary } from '@ia-task-manager/schemas/insights'

export class InsightsController {
  constructor(private readonly insightsUseCase: IInsightsUseCase) {}

  summarizeDay(todos: Todo[]): Promise<DaySummary> {
    return this.insightsUseCase.summarizeDay(todos)
  }
}
