'use client'

import { useMemo } from 'react'
import { Badge, Button, Checkbox, Group, Stack, Table, Text } from '@mantine/core'
import { IconClipboardList, IconFilterOff, IconPencil, IconTrash } from '@tabler/icons-react'
import { useTable } from '@tanstack/react-table'
import type { SortingState, Updater } from '@tanstack/react-table'
import type { Todo } from '@ia-task-manager/schemas/todo'
import { priorityColors, priorityLabels } from '@/lib/constants/todo.constants'
import { DEFAULT_TODO_SORT, TODO_SORT_FIELDS, filterTodos } from '@/lib/todo/todo-filters'
import type { TodoFilters, TodoSort } from '@/lib/todo/todo-filters'
import { useTodoFilters } from '@/lib/todo/use-todo-filters'
import { formatDate } from '@/lib/utils/date'
import { notifyError, notifySuccess } from '@/lib/utils/notifications'
import { useDeleteTodoMutation, useUpdateTodoMutation } from '@/services/todo/todo.mutation'
import { TableSortHeader } from '../table-sort-header/table-sort-header'
import { todoColumnHelper, todoTableFeatures } from './todo-table-features'

const toTodoSort = (sorting: SortingState): TodoSort => {
  const entry = sorting[0]
  if (!entry) return DEFAULT_TODO_SORT
  const field = TODO_SORT_FIELDS.find((candidate) => candidate === entry.id)
  if (!field) return DEFAULT_TODO_SORT
  return { field, direction: entry.desc ? 'desc' : 'asc' }
}

const resolveUpdater = <T,>(updater: Updater<T>, current: T): T =>
  typeof updater === 'function' ? (updater as (previous: T) => T)(current) : updater

type TableTodoListProps = {
  todos: Todo[]
  onEdit: (todo: Todo) => void
}

export function TableTodoList({ todos, onEdit }: TableTodoListProps) {
  const updateMutation = useUpdateTodoMutation()
  const deleteMutation = useDeleteTodoMutation()
  const { filters, setFilters, clearFilters, isFiltered } = useTodoFilters()

  const filteredTodos = useMemo(() => filterTodos(todos, filters), [todos, filters])

  const columns = useMemo(
    () =>
      todoColumnHelper.columns([
        todoColumnHelper.accessor('completed', {
          sortFn: 'basic',
          header: ({ column }) => <TableSortHeader column={column} label="Concluída" />,
          cell: ({ row }) => (
            <Checkbox
              checked={row.original.completed}
              onChange={(event) =>
                updateMutation.mutate(
                  { id: row.original.id, input: { completed: event.currentTarget.checked } },
                  { onError: notifyError('Erro ao atualizar') },
                )
              }
              aria-label={`Marcar ${row.original.title} como concluída`}
            />
          ),
        }),
        todoColumnHelper.accessor('title', {
          sortFn: 'alphanumeric',
          header: ({ column }) => <TableSortHeader column={column} label="Título" />,
          cell: ({ row }) => (
            <Text
              td={row.original.completed ? 'line-through' : undefined}
              c={row.original.completed ? 'dimmed' : undefined}
            >
              {row.original.title}
            </Text>
          ),
        }),
        todoColumnHelper.accessor('priority', {
          sortFn: 'priority',
          header: ({ column }) => <TableSortHeader column={column} label="Prioridade" />,
          cell: ({ row }) => (
            <Badge color={priorityColors[row.original.priority]} variant="light">
              {priorityLabels[row.original.priority]}
            </Badge>
          ),
        }),
        todoColumnHelper.accessor('dueDate', {
          sortFn: 'dueDate',
          header: ({ column }) => <TableSortHeader column={column} label="Vencimento" />,
          cell: ({ row }) => formatDate(row.original.dueDate),
        }),
        todoColumnHelper.accessor('subtasks', {
          enableSorting: false,
          header: 'Subtasks',
          cell: ({ row }) => row.original.subtasks?.length ?? 0,
        }),
        todoColumnHelper.display({
          id: 'actions',
          header: 'Ações',
          cell: ({ row }) => (
            <Group justify="flex-end" gap="xs" wrap="nowrap">
              <Button
                variant="subtle"
                size="compact-xs"
                leftSection={<IconPencil size={14} />}
                onClick={() => onEdit(row.original)}
              >
                Editar
              </Button>
              <Button
                variant="subtle"
                color="red"
                size="compact-xs"
                leftSection={<IconTrash size={14} />}
                onClick={() =>
                  deleteMutation.mutate(row.original.id, {
                    onSuccess: () => notifySuccess('Tarefa removida', 'A tarefa foi excluída.'),
                    onError: notifyError('Erro ao remover'),
                  })
                }
              >
                Remover
              </Button>
            </Group>
          ),
        }),
      ]),
    [deleteMutation, onEdit, updateMutation],
  )

  const sorting = useMemo<SortingState>(
    () => [{ id: filters.sort.field, desc: filters.sort.direction === 'desc' }],
    [filters.sort],
  )

  const table = useTable({
    features: todoTableFeatures,
    columns,
    data: filteredTodos,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = resolveUpdater(updater, sorting)
      const nextFilters: Partial<TodoFilters> = { sort: toTodoSort(next) }
      setFilters(nextFilters)
    },
  })

  if (todos.length === 0) {
    return (
      <Stack align="center" gap="xs" py="xl">
        <IconClipboardList size={40} />
        <Text c="dimmed">Nenhuma tarefa ainda.</Text>
        <Text size="sm" c="dimmed">
          Crie manualmente ou peça uma sugestão à IA.
        </Text>
      </Stack>
    )
  }

  if (filteredTodos.length === 0) {
    return (
      <Stack align="center" gap="xs" py="xl">
        <IconFilterOff size={40} />
        <Text c="dimmed">Nenhuma tarefa corresponde aos filtros.</Text>
        <Button variant="subtle" leftSection={<IconFilterOff size={16} />} onClick={clearFilters}>
          Limpar filtros
        </Button>
      </Stack>
    )
  }

  return (
    <>
      {isFiltered && (
        <Text size="sm" c="dimmed" mb="xs">
          {filteredTodos.length} de {todos.length} tarefas
        </Text>
      )}

      <Table highlightOnHover stickyHeader>
        <Table.Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.Th key={header.id}>
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </Table.Th>
              ))}
            </Table.Tr>
          ))}
        </Table.Thead>
        <Table.Tbody>
          {table.getRowModel().rows.map((row) => (
            <Table.Tr key={row.id}>
              {row.getAllCells().map((cell) => (
                <Table.Td key={cell.id}>
                  <table.FlexRender cell={cell} />
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  )
}
