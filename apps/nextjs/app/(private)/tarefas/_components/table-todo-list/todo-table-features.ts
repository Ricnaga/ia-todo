import {
  constructSortFn,
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
} from '@tanstack/react-table'
import type { Todo, TodoPriority } from '@ia-task-manager/schemas/todo'

const PRIORITY_ORDER: Record<TodoPriority, number> = { low: 0, medium: 1, high: 2, urgent: 3 }

const sortByPriority = constructSortFn({
  sort: (a: TodoPriority, b: TodoPriority) => PRIORITY_ORDER[a] - PRIORITY_ORDER[b],
})

const sortByDueDate = constructSortFn({
  sort: (a: Date | null, b: Date | null) => {
    if (a === b) return 0
    if (a === null) return 1
    if (b === null) return -1
    return a < b ? -1 : 1
  },
})

export const todoTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    priority: sortByPriority,
    dueDate: sortByDueDate,
  },
})

export const todoColumnHelper = createColumnHelper<typeof todoTableFeatures, Todo>()
