import type { Todo } from '@/lib/schemas/todo'
import type { DaySummary } from '@/lib/schemas/insights'

export interface InsightsPort {
  summarizeDay(todos: Todo[]): Promise<DaySummary>
}
