import type { SummarizeDayUseCase } from '@/server/modules/insights/use-cases/summarize-day.use-case'
import type { Todo } from '@/lib/schemas/todo'
import type { DaySummary } from '@/lib/schemas/insights'

export class InsightsController {
  constructor(private readonly useCases: { summarizeDay: SummarizeDayUseCase }) {}

  summarizeDay(todos: Todo[]): Promise<DaySummary> {
    return this.useCases.summarizeDay.execute(todos)
  }
}
