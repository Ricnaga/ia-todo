import type { Todo } from '@ia-task-manager/schemas/todo'
import type { DaySummary } from '@ia-task-manager/schemas/insights'

export interface IInsightsUseCase {
  summarizeDay(todos: Todo[]): Promise<DaySummary>
}
