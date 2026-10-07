import type { TodoPriority } from '@ia-task-manager/schemas/todo'

export const priorityLabels: Record<TodoPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
}

export const priorityColors = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  urgent: 'error',
} as const satisfies Record<TodoPriority, string>
