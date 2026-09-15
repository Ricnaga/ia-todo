import type { Todo, TodoSubtask } from '@/lib/shared/todos/todo.types'
import type { DaySummary, SearchCriteria, TodoSuggestion } from '@/lib/schemas/ai'
import type { SearchResult } from '@/lib/shared/ai/search'
import { builder, DateTimeScalar, PriorityEnum } from '@/bff/graphql/builder'

export const TodoRef = builder.objectRef<Todo>('Todo')

const SubtaskRef = builder.objectRef<TodoSubtask>('Subtask')

export const PriorityInputEnum = PriorityEnum

export const CreateTodoInput = builder.inputType('CreateTodoInput', {
  fields: (t) => ({
    title: t.string({ required: true }),
    description: t.string(),
    priority: t.field({ type: PriorityEnum }),
    dueDate: t.field({ type: DateTimeScalar }),
  }),
})

export const UpdateTodoInput = builder.inputType('UpdateTodoInput', {
  fields: (t) => ({
    title: t.string(),
    description: t.string(),
    priority: t.field({ type: PriorityEnum }),
    dueDate: t.field({ type: DateTimeScalar }),
    completed: t.boolean(),
  }),
})

export const DraftInput = builder.inputType('DraftInput', {
  fields: (t) => ({
    title: t.string(),
    description: t.string(),
  }),
})

const SearchStatusEnum = builder.enumType('SearchStatus', {
  values: ['any', 'pending', 'completed'],
})

const SearchPriorityEnum = builder.enumType('SearchPriority', {
  values: ['any', 'low', 'medium', 'high', 'urgent'],
})

const SearchDueEnum = builder.enumType('SearchDue', {
  values: ['any', 'today', 'this_week', 'overdue', 'none'],
})

export const TodoSuggestionRef = builder.objectRef<TodoSuggestion>('TodoSuggestion')
export const DaySummaryRef = builder.objectRef<DaySummary>('DaySummary')
export const SearchCriteriaRef = builder.objectRef<SearchCriteria>('SearchCriteria')
export const SearchResultRef = builder.objectRef<SearchResult>('SearchResult')

SubtaskRef.implement({
  fields: (t) => ({
    id: t.exposeString('id'),
    title: t.exposeString('title'),
    done: t.exposeBoolean('done'),
  }),
})

TodoRef.implement({
  fields: (t) => ({
    id: t.exposeString('id'),
    title: t.exposeString('title'),
    description: t.exposeString('description', { nullable: true }),
    priority: t.expose('priority', { type: PriorityEnum }),
    dueDate: t.field({
      type: DateTimeScalar,
      nullable: true,
      resolve: (todo) => todo.dueDate,
    }),
    subtasks: t.field({
      type: [SubtaskRef],
      nullable: true,
      resolve: (todo) => todo.subtasks ?? undefined,
    }),
    completed: t.exposeBoolean('completed'),
    createdAt: t.field({
      type: DateTimeScalar,
      resolve: (todo) => todo.createdAt,
    }),
    updatedAt: t.field({
      type: DateTimeScalar,
      resolve: (todo) => todo.updatedAt,
    }),
  }),
})

TodoSuggestionRef.implement({
  fields: (t) => ({
    title: t.exposeString('title'),
    description: t.exposeString('description'),
    priority: t.expose('priority', { type: PriorityEnum }),
    subtasks: t.exposeStringList('subtasks'),
  }),
})

DaySummaryRef.implement({
  fields: (t) => ({
    summary: t.exposeString('summary'),
    focus: t.exposeString('focus'),
    suggestedOrder: t.exposeStringList('suggestedOrder'),
  }),
})

SearchCriteriaRef.implement({
  fields: (t) => ({
    query: t.exposeString('query'),
    keywords: t.exposeStringList('keywords'),
    status: t.expose('status', { type: SearchStatusEnum }),
    priority: t.expose('priority', { type: SearchPriorityEnum }),
    due: t.field({
      type: SearchDueEnum,
      resolve: (criteria) => (criteria.due === 'thisWeek' ? 'this_week' : criteria.due),
    }),
  }),
})

SearchResultRef.implement({
  fields: (t) => ({
    criteria: t.expose('criteria', { type: SearchCriteriaRef }),
    results: t.expose('results', { type: [TodoRef] }),
  }),
})
