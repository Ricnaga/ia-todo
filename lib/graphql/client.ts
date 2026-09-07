import { ClientError, GraphQLClient } from 'graphql-request'
import type { Todo, TodoPriority, TodoSubtask } from '@/lib/shared/todos/todo.types'
import type { DaySummary, DraftInput, SearchCriteria, TodoSuggestion } from '@/lib/schemas/ai'
import type { SearchResult } from '@/lib/shared/ai/search'

const client = new GraphQLClient('/api/graphql')

type TodoWire = {
  id: string
  title: string
  description: string | null
  priority: TodoPriority
  dueDate: string | null
  subtasks: TodoSubtask[] | null
  completed: boolean
  createdAt: string
  updatedAt: string
}

type SearchCriteriaWire = Omit<SearchCriteria, 'due'> & {
  due: 'any' | 'today' | 'this_week' | 'overdue' | 'none'
}

type SearchResultWire = {
  criteria: SearchCriteriaWire
  results: TodoWire[]
}

function toTodo(todo: TodoWire): Todo {
  return {
    ...todo,
    dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
    createdAt: new Date(todo.createdAt),
    updatedAt: new Date(todo.updatedAt),
  }
}

function toSearchResult(result: SearchResultWire): SearchResult {
  return {
    criteria: {
      ...result.criteria,
      due: result.criteria.due === 'this_week' ? 'this-week' : result.criteria.due,
    },
    results: result.results.map(toTodo),
  }
}

async function request<T>(document: string, variables?: Record<string, unknown>): Promise<T> {
  try {
    return await client.request<T>(document, variables)
  } catch (error) {
    if (error instanceof ClientError) {
      throw new Error(error.response.errors?.[0]?.message ?? error.message)
    }
    throw error
  }
}

const TODO_FIELDS = `
  id
  title
  description
  priority
  dueDate
  completed
  createdAt
  updatedAt
  subtasks { id title done }
`

export type TodoCreateRequest = {
  title: string
  description?: string | null
  priority?: TodoPriority
  dueDate?: string | null
}

export type TodoUpdateRequest = Partial<TodoCreateRequest> & { completed?: boolean }

export async function listTodos(): Promise<Todo[]> {
  const data = await request<{ todos: TodoWire[] }>(`
    query ListTodos {
      todos {
        ${TODO_FIELDS}
      }
    }
  `)
  return data.todos.map(toTodo)
}

export async function getTodo(id: string): Promise<Todo> {
  const data = await request<{ todo: TodoWire }>(
    `
      query GetTodo($id: String!) {
        todo(id: $id) {
          ${TODO_FIELDS}
        }
      }
    `,
    { id },
  )
  return toTodo(data.todo)
}

export async function createTodo(input: TodoCreateRequest): Promise<Todo> {
  const data = await request<{ createTodo: TodoWire }>(
    `
      mutation CreateTodo($input: CreateTodoInput!) {
        createTodo(input: $input) {
          ${TODO_FIELDS}
        }
      }
    `,
    { input },
  )
  return toTodo(data.createTodo)
}

export async function updateTodo(id: string, input: TodoUpdateRequest): Promise<Todo> {
  const data = await request<{ updateTodo: TodoWire }>(
    `
      mutation UpdateTodo($id: String!, $input: UpdateTodoInput!) {
        updateTodo(id: $id, input: $input) {
          ${TODO_FIELDS}
        }
      }
    `,
    { id, input },
  )
  return toTodo(data.updateTodo)
}

export async function deleteTodo(id: string): Promise<void> {
  await request<{ deleteTodo: boolean }>(
    `
      mutation DeleteTodo($id: String!) {
        deleteTodo(id: $id)
      }
    `,
    { id },
  )
}

export async function suggestTodo(draft: DraftInput): Promise<TodoSuggestion> {
  const data = await request<{ suggestTodo: TodoSuggestion }>(
    `
      mutation SuggestTodo($draft: DraftInput!) {
        suggestTodo(draft: $draft) {
          title
          description
          priority
          subtasks
        }
      }
    `,
    { draft },
  )
  return data.suggestTodo
}

export async function summarizeDay(): Promise<DaySummary> {
  const data = await request<{ summarizeDay: DaySummary }>(
    `
      mutation SummarizeDay {
        summarizeDay {
          summary
          focus
          suggestedOrder
        }
      }
    `,
  )
  return data.summarizeDay
}

export async function nlSearch(query: string): Promise<SearchResult> {
  const data = await request<{ nlSearch: SearchResultWire }>(
    `
      mutation NlSearch($query: String!) {
        nlSearch(query: $query) {
          criteria {
            query
            keywords
            status
            priority
            due
          }
          results {
            ${TODO_FIELDS}
          }
        }
      }
    `,
    { query },
  )
  return toSearchResult(data.nlSearch)
}
