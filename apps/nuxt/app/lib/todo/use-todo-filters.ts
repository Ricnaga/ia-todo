import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { navigateTo, useRoute } from '#imports'
import type { LocationQuery } from 'vue-router'
import { buildTodoSearchParams, isTodoFiltersActive, parseTodoFilters } from './todo-filters'
import type { TodoFilters } from './todo-filters'

export type TodoFiltersApi = {
  filters: ComputedRef<TodoFilters>
  setFilters: (patch: Partial<TodoFilters>) => void
  clearFilters: () => void
  isFiltered: ComputedRef<boolean>
}

function toSearchParams(query: LocationQuery): Pick<URLSearchParams, 'get'> {
  return {
    get(name: string) {
      const value = query[name]
      if (value === undefined) return null
      return Array.isArray(value) ? (value[0] ?? null) : value
    },
  }
}

export function useTodoFilters(): TodoFiltersApi {
  const route = useRoute()

  const filters = computed(() => parseTodoFilters(toSearchParams(route.query)))

  const setFilters = (patch: Partial<TodoFilters>) => {
    const next = { ...filters.value, ...patch }
    const params = new URLSearchParams(buildTodoSearchParams(next))
    const query: Record<string, string> = {}
    params.forEach((value, key) => {
      query[key] = value
    })
    void navigateTo({ path: route.path, query }, { replace: true })
  }

  const clearFilters = () => {
    void navigateTo({ path: route.path }, { replace: true })
  }

  return {
    filters,
    setFilters,
    clearFilters,
    isFiltered: computed(() => isTodoFiltersActive(filters.value)),
  }
}
