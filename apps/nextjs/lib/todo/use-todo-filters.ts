'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { buildTodoSearchParams, isTodoFiltersActive, parseTodoFilters } from './todo-filters'
import type { TodoFilters } from './todo-filters'

export type TodoFiltersApi = {
  filters: TodoFilters
  setFilters: (patch: Partial<TodoFilters>) => void
  clearFilters: () => void
  isFiltered: boolean
}

export function useTodoFilters(): TodoFiltersApi {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = useMemo(() => parseTodoFilters(searchParams), [searchParams])

  const setFilters = useCallback(
    (patch: Partial<TodoFilters>) => {
      const next = { ...filters, ...patch }
      const query = buildTodoSearchParams(next)
      router.replace(query ? `${pathname}${query}` : pathname, { scroll: false })
    },
    [filters, pathname, router],
  )

  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false })
  }, [pathname, router])

  return { filters, setFilters, clearFilters, isFiltered: isTodoFiltersActive(filters) }
}
