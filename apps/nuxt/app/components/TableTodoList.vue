<script setup lang="ts">
import { computed } from 'vue'
import type { ColumnDef, SortingFn, SortingState } from '@tanstack/vue-table'
import type { Todo, TodoPriority } from '@ia-task-manager/schemas/todo'
import { priorityColors, priorityLabels } from '~/lib/constants/todo.constants'
import { DEFAULT_TODO_SORT, TODO_SORT_FIELDS, filterTodos } from '~/lib/todo/todo-filters'
import type { TodoSort } from '~/lib/todo/todo-filters'
import { useTodoFilters } from '~/lib/todo/use-todo-filters'
import { formatDate } from '~/lib/utils/date'
import { useNotifications } from '~/lib/utils/notifications'
import { useDeleteTodoMutation, useUpdateTodoMutation } from '~/services/todo/todo.mutation'

const props = defineProps<{ todos: Todo[] }>()
const emit = defineEmits<{ edit: [todo: Todo] }>()

const updateMutation = useUpdateTodoMutation()
const deleteMutation = useDeleteTodoMutation()
const { notifyError, notifySuccess } = useNotifications()
const { filters, setFilters, clearFilters, isFiltered } = useTodoFilters()

const filteredTodos = computed(() => filterTodos(props.todos, filters.value))

const PRIORITY_ORDER: Record<TodoPriority, number> = { low: 0, medium: 1, high: 2, urgent: 3 }

const sortByPriority: SortingFn<Todo> = (a, b) =>
  PRIORITY_ORDER[a.original.priority] - PRIORITY_ORDER[b.original.priority]

const sortByDueDate: SortingFn<Todo> = (a, b) => {
  const left = a.original.dueDate
  const right = b.original.dueDate
  if (left === right) return 0
  if (left === null) return 1
  if (right === null) return -1
  return left < right ? -1 : 1
}

const columns: ColumnDef<Todo>[] = [
  { accessorKey: 'completed', header: 'Concluída', enableSorting: true, sortingFn: 'basic' },
  { accessorKey: 'title', header: 'Título', enableSorting: true, sortingFn: 'alphanumeric' },
  { accessorKey: 'priority', header: 'Prioridade', enableSorting: true, sortingFn: sortByPriority },
  { accessorKey: 'dueDate', header: 'Vencimento', enableSorting: true, sortingFn: sortByDueDate },
  { accessorKey: 'subtasks', header: 'Subtasks', enableSorting: false },
  { id: 'actions', header: 'Ações', enableSorting: false },
]

function toTodoSort(sorting: SortingState): TodoSort {
  const entry = sorting[0]
  if (!entry) return DEFAULT_TODO_SORT
  const field = TODO_SORT_FIELDS.find((candidate) => candidate === entry.id)
  if (!field) return DEFAULT_TODO_SORT
  return { field, direction: entry.desc ? 'desc' : 'asc' }
}

const sorting = computed<SortingState>({
  get: () => [{ id: filters.value.sort.field, desc: filters.value.sort.direction === 'desc' }],
  set: (value) => setFilters({ sort: toTodoSort(value) }),
})

function onToggleCompleted(todo: Todo, value: unknown) {
  updateMutation.mutate(
    { id: todo.id, input: { completed: value === true } },
    { onError: notifyError('Erro ao atualizar') },
  )
}

function onDelete(todo: Todo) {
  deleteMutation.mutate(todo.id, {
    onSuccess: () => notifySuccess('Tarefa removida', 'A tarefa foi excluída.'),
    onError: notifyError('Erro ao remover'),
  })
}
</script>

<template>
  <div v-if="props.todos.length === 0" class="flex flex-col items-center gap-1 py-10 text-center">
    <UIcon name="i-tabler:clipboard-list" class="text-dimmed size-10" />
    <p class="text-dimmed">Nenhuma tarefa ainda.</p>
    <p class="text-dimmed text-sm">Crie manualmente ou peça uma sugestão à IA.</p>
  </div>

  <div
    v-else-if="filteredTodos.length === 0"
    class="flex flex-col items-center gap-3 py-10 text-center"
  >
    <UIcon name="i-tabler:filter-off" class="text-dimmed size-10" />
    <p class="text-dimmed">Nenhuma tarefa corresponde aos filtros.</p>
    <UButton icon="i-tabler:filter-off" variant="subtle" color="neutral" @click="clearFilters">
      Limpar filtros
    </UButton>
  </div>

  <div v-else class="flex flex-col gap-2">
    <p v-if="isFiltered" class="text-dimmed text-sm">
      {{ filteredTodos.length }} de {{ props.todos.length }} tarefas
    </p>

    <UTable v-model:sorting="sorting" :data="filteredTodos" :columns="columns" sticky>
      <template #completed-header="{ header }">
        <TableSortHeader :header="header" label="Concluída" />
      </template>
      <template #completed-cell="{ row }">
        <UCheckbox
          :model-value="row.original.completed"
          :aria-label="`Marcar ${row.original.title} como concluída`"
          @update:model-value="onToggleCompleted(row.original, $event)"
        />
      </template>

      <template #title-header="{ header }">
        <TableSortHeader :header="header" label="Título" />
      </template>
      <template #title-cell="{ row }">
        <span :class="{ 'text-dimmed line-through': row.original.completed }">
          {{ row.original.title }}
        </span>
      </template>

      <template #priority-header="{ header }">
        <TableSortHeader :header="header" label="Prioridade" />
      </template>
      <template #priority-cell="{ row }">
        <UBadge :color="priorityColors[row.original.priority]" variant="soft">
          {{ priorityLabels[row.original.priority] }}
        </UBadge>
      </template>

      <template #dueDate-header="{ header }">
        <TableSortHeader :header="header" label="Vencimento" />
      </template>
      <template #dueDate-cell="{ row }">
        {{ formatDate(row.original.dueDate) }}
      </template>

      <template #subtasks-cell="{ row }">
        {{ row.original.subtasks?.length ?? 0 }}
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center justify-end gap-1">
          <UButton
            icon="i-tabler:pencil"
            variant="ghost"
            size="xs"
            @click="emit('edit', row.original)"
          >
            Editar
          </UButton>
          <UButton
            icon="i-tabler:trash"
            variant="ghost"
            color="error"
            size="xs"
            @click="onDelete(row.original)"
          >
            Remover
          </UButton>
        </div>
      </template>
    </UTable>
  </div>
</template>
