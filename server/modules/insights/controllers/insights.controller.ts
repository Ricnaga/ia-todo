import type { SummarizeDayUseCase } from '@/server/modules/insights/use-cases/summarize-day.use-case'
import type { Todo } from '@/lib/shared/todos/todo.types'
import type { DaySummary } from '@/lib/schemas/ai'

export class InsightsController {
  constructor(private readonly useCases: { summarizeDay: SummarizeDayUseCase }) {}

  summarizeDay(todos: Todo[]): Promise<DaySummary> {
    return this.useCases.summarizeDay.execute(todos)
  }
}
