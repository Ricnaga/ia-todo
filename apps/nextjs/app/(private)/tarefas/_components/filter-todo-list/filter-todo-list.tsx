'use client'

import { Button, Group, Select, TextInput } from '@mantine/core'
import { IconFilterOff, IconSearch } from '@tabler/icons-react'
import { priorityLabels } from '@/lib/constants/todo.constants'
import { TODO_PRIORITY_FILTERS, TODO_STATUS_FILTERS } from '@/lib/todo/todo-filters'
import type { TodoPriorityFilter, TodoStatusFilter } from '@/lib/todo/todo-filters'
import { useTodoFilters } from '@/lib/todo/use-todo-filters'

const ALL_LABEL = 'Todas'

const statusOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'completed', label: 'Concluídas' },
]

const priorityOptions = TODO_PRIORITY_FILTERS.map((value) => ({
  value,
  label: value === 'all' ? ALL_LABEL : priorityLabels[value],
}))

const toStatus = (value: string | null): TodoStatusFilter =>
  TODO_STATUS_FILTERS.find((option) => option === value) ?? 'all'

const toPriority = (value: string | null): TodoPriorityFilter =>
  TODO_PRIORITY_FILTERS.find((option) => option === value) ?? 'all'

export function FilterTodoList() {
  const { filters, setFilters, clearFilters, isFiltered } = useTodoFilters()

  return (
    <Group align="flex-end" gap="sm" wrap="wrap">
      <TextInput
        label="Buscar"
        placeholder="Título ou descrição"
        leftSection={<IconSearch size={16} />}
        value={filters.q}
        onChange={(event) => setFilters({ q: event.currentTarget.value })}
        w={{ base: '100%', sm: 280 }}
      />

      <Select
        label="Status"
        data={statusOptions}
        value={filters.status}
        onChange={(value) => setFilters({ status: toStatus(value) })}
        allowDeselect={false}
        w={160}
      />

      <Select
        label="Prioridade"
        data={priorityOptions}
        value={filters.priority}
        onChange={(value) => setFilters({ priority: toPriority(value) })}
        allowDeselect={false}
        w={160}
      />

      {isFiltered && (
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconFilterOff size={16} />}
          onClick={clearFilters}
        >
          Limpar filtros
        </Button>
      )}
    </Group>
  )
}
