import type { Todo } from '@/lib/shared/todos/todo.types'
import type { DaySummary } from '@/lib/schemas/ai'

export interface InsightsPort {
  summarizeDay(todos: Todo[]): Promise<DaySummary>
}
