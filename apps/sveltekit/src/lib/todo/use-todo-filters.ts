import { goto } from '$app/navigation'
import { resolve } from '$app/paths'
import { page } from '$app/state'
import { paths } from '$lib/constants/paths'
import {
  buildTodoSearchParams,
  isTodoFiltersActive,
  parseTodoFilters,
} from '$lib/todo/todo-filters'
import type { TodoFilters } from '$lib/todo/todo-filters'

export type TodoFiltersApi = {
  readonly filters: TodoFilters
  readonly isFiltered: boolean
  setFilters: (patch: Partial<TodoFilters>) => void
  clearFilters: () => void
}

export function useTodoFilters(): TodoFiltersApi {
  const currentFilters = (): TodoFilters => parseTodoFilters(page.url.searchParams)

  const navigate = (query: `?${string}` | ''): void => {
    void goto(resolve(`${paths.TAREFAS}${query}`), {
      replaceState: true,
      keepFocus: true,
      noScroll: true,
    })
  }

  const setFilters = (patch: Partial<TodoFilters>): void => {
    navigate(buildTodoSearchParams({ ...currentFilters(), ...patch }))
  }

  const clearFilters = (): void => {
    navigate('')
  }

  return {
    get filters() {
      return currentFilters()
    },
    get isFiltered() {
      return isTodoFiltersActive(currentFilters())
    },
    setFilters,
    clearFilters,
  }
}
