import type { TodoPriority } from '@ia-task-manager/schemas/todo'

export const priorityLabels: Record<TodoPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
}

export const priorityColors: Record<TodoPriority, string> = {
  low: 'preset-tonal',
  medium: 'preset-tonal-primary',
  high: 'preset-tonal-warning',
  urgent: 'preset-tonal-error',
}

export const priorityOptions: { value: TodoPriority; label: string }[] = (
  Object.keys(priorityLabels) as TodoPriority[]
).map((value) => ({ value, label: priorityLabels[value] }))
