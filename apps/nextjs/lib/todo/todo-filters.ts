import { z } from 'zod'
import type { Todo } from '@ia-task-manager/schemas/todo'

export const TODO_STATUS_FILTERS = ['all', 'pending', 'completed'] as const
export const TODO_PRIORITY_FILTERS = ['all', 'low', 'medium', 'high', 'urgent'] as const
export const TODO_SORT_FIELDS = ['title', 'priority', 'dueDate', 'completed'] as const

export type TodoStatusFilter = (typeof TODO_STATUS_FILTERS)[number]
export type TodoPriorityFilter = (typeof TODO_PRIORITY_FILTERS)[number]
export type TodoSortField = (typeof TODO_SORT_FIELDS)[number]
export type TodoSort = { field: TodoSortField; direction: 'asc' | 'desc' }

export type TodoFilters = {
  status: TodoStatusFilter
  priority: TodoPriorityFilter
  q: string
  sort: TodoSort
}

export const DEFAULT_TODO_SORT: TodoSort = { field: 'title', direction: 'asc' }

export const DEFAULT_TODO_FILTERS: TodoFilters = {
  status: 'all',
  priority: 'all',
  q: '',
  sort: DEFAULT_TODO_SORT,
}

const statusSchema = z.enum(TODO_STATUS_FILTERS).catch('all')
const priorityFilterSchema = z.enum(TODO_PRIORITY_FILTERS).catch('all')
const querySchema = z.string().trim().max(120).catch('')
const sortFieldSchema = z.enum(TODO_SORT_FIELDS)
const sortDirectionSchema = z.enum(['asc', 'desc'])

type SearchParamsLike = Pick<URLSearchParams, 'get'>

function parseTodoSort(raw: string | null): TodoSort {
  const [field, direction] = (raw ?? '').split('.')
  const parsedField = sortFieldSchema.safeParse(field)
  const parsedDirection = sortDirectionSchema.safeParse(direction)
  if (!parsedField.success || !parsedDirection.success) return DEFAULT_TODO_SORT
  return { field: parsedField.data, direction: parsedDirection.data }
}

export function parseTodoFilters(params: SearchParamsLike): TodoFilters {
  return {
    status: statusSchema.parse(params.get('status')),
    priority: priorityFilterSchema.parse(params.get('priority')),
    q: querySchema.parse(params.get('q')),
    sort: parseTodoSort(params.get('sort')),
  }
}

export function buildTodoSearchParams(filters: TodoFilters): string {
  const params = new URLSearchParams()
  if (filters.status !== DEFAULT_TODO_FILTERS.status) params.set('status', filters.status)
  if (filters.priority !== DEFAULT_TODO_FILTERS.priority) {
    params.set('priority', filters.priority)
  }
  if (filters.q) params.set('q', filters.q)
  if (
    filters.sort.field !== DEFAULT_TODO_SORT.field ||
    filters.sort.direction !== DEFAULT_TODO_SORT.direction
  ) {
    params.set('sort', `${filters.sort.field}.${filters.sort.direction}`)
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function isTodoFiltersActive(filters: TodoFilters): boolean {
  return (
    filters.status !== DEFAULT_TODO_FILTERS.status ||
    filters.priority !== DEFAULT_TODO_FILTERS.priority ||
    filters.q !== DEFAULT_TODO_FILTERS.q ||
    filters.sort.field !== DEFAULT_TODO_SORT.field ||
    filters.sort.direction !== DEFAULT_TODO_SORT.direction
  )
}

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

function matchesQuery(todo: Todo, query: string): boolean {
  if (!query) return true
  const needle = normalizeText(query)
  if (normalizeText(todo.title).includes(needle)) return true
  if (!todo.description) return false
  return normalizeText(todo.description).includes(needle)
}

export function matchesTodoFilters(todo: Todo, filters: TodoFilters): boolean {
  if (filters.status === 'pending' && todo.completed) return false
  if (filters.status === 'completed' && !todo.completed) return false
  if (filters.priority !== 'all' && todo.priority !== filters.priority) return false
  return matchesQuery(todo, filters.q)
}

export function filterTodos(todos: Todo[], filters: TodoFilters): Todo[] {
  if (!isTodoFiltersActive(filters)) return todos
  return todos.filter((todo) => matchesTodoFilters(todo, filters))
}
