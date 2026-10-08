<script lang="ts">
  import { IconClipboardList, IconFilterOff } from '@tabler/icons-svelte'
  import { FlexRender, createTable, renderComponent } from '@tanstack/svelte-table'
  import type { SortingState, Updater } from '@tanstack/svelte-table'
  import type { Todo } from '@ia-task-manager/schemas/todo'
  import TableSortHeader from '../table-sort-header/table-sort-header.svelte'
  import TableTodoActionsCell from '../table-todo-actions-cell/table-todo-actions-cell.svelte'
  import TableTodoCompletedCell from '../table-todo-completed-cell/table-todo-completed-cell.svelte'
  import TableTodoPriorityCell from '../table-todo-priority-cell/table-todo-priority-cell.svelte'
  import TableTodoTitleCell from '../table-todo-title-cell/table-todo-title-cell.svelte'
  import { useDeleteTodoMutation, useUpdateTodoMutation } from '$lib/services/todo/todo.mutation'
  import { DEFAULT_TODO_SORT, TODO_SORT_FIELDS, filterTodos } from '$lib/todo/todo-filters'
  import type { TodoSort } from '$lib/todo/todo-filters'
  import { todoColumnHelper, todoTableFeatures } from '$lib/todo/todo-table-features'
  import { useTodoFilters } from '$lib/todo/use-todo-filters'
  import { formatDate } from '$lib/utils/date'
  import { notifyError, notifySuccess } from '$lib/utils/notifications'

  interface Props {
    todos: Todo[]
    onedit: (todo: Todo) => void
  }

  let { todos, onedit }: Props = $props()

  const updateMutation = useUpdateTodoMutation()
  const deleteMutation = useDeleteTodoMutation()
  const todoFilters = useTodoFilters()

  const filteredTodos = $derived(filterTodos(todos, todoFilters.filters))

  function toTodoSort(sorting: SortingState): TodoSort {
    const entry = sorting[0]
    if (!entry) return DEFAULT_TODO_SORT
    const field = TODO_SORT_FIELDS.find((candidate) => candidate === entry.id)
    if (!field) return DEFAULT_TODO_SORT
    return { field, direction: entry.desc ? 'desc' : 'asc' }
  }

  function onToggleCompleted(todo: Todo, completed: boolean): void {
    updateMutation.mutate(
      { id: todo.id, input: { completed } },
      { onError: notifyError('Erro ao atualizar') },
    )
  }

  function onDelete(todo: Todo): void {
    deleteMutation.mutate(todo.id, {
      onSuccess: () => notifySuccess('Tarefa removida', 'A tarefa foi excluída.'),
      onError: notifyError('Erro ao remover'),
    })
  }

  const columns = todoColumnHelper.columns([
    todoColumnHelper.accessor('completed', {
      sortFn: 'basic',
      header: ({ column }) =>
        renderComponent(TableSortHeader, {
          label: 'Concluída',
          sorted: column.getIsSorted(),
          ontoggle: (event: MouseEvent) => column.getToggleSortingHandler()?.(event),
        }),
      cell: ({ row }) =>
        renderComponent(TableTodoCompletedCell, {
          todo: row.original,
          ontoggle: (completed: boolean) => onToggleCompleted(row.original, completed),
        }),
    }),
    todoColumnHelper.accessor('title', {
      sortFn: 'alphanumeric',
      header: ({ column }) =>
        renderComponent(TableSortHeader, {
          label: 'Título',
          sorted: column.getIsSorted(),
          ontoggle: (event: MouseEvent) => column.getToggleSortingHandler()?.(event),
        }),
      cell: ({ row }) => renderComponent(TableTodoTitleCell, { todo: row.original }),
    }),
    todoColumnHelper.accessor('priority', {
      sortFn: 'priority',
      header: ({ column }) =>
        renderComponent(TableSortHeader, {
          label: 'Prioridade',
          sorted: column.getIsSorted(),
          ontoggle: (event: MouseEvent) => column.getToggleSortingHandler()?.(event),
        }),
      cell: ({ row }) => renderComponent(TableTodoPriorityCell, { todo: row.original }),
    }),
    todoColumnHelper.accessor('dueDate', {
      sortFn: 'dueDate',
      header: ({ column }) =>
        renderComponent(TableSortHeader, {
          label: 'Vencimento',
          sorted: column.getIsSorted(),
          ontoggle: (event: MouseEvent) => column.getToggleSortingHandler()?.(event),
        }),
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
      cell: ({ row }) =>
        renderComponent(TableTodoActionsCell, {
          todo: row.original,
          onedit,
          onremove: onDelete,
        }),
    }),
  ])

  const sorting = $derived<SortingState>([
    { id: todoFilters.filters.sort.field, desc: todoFilters.filters.sort.direction === 'desc' },
  ])

  const table = createTable({
    features: todoTableFeatures,
    columns,
    get data() {
      return filteredTodos
    },
    state: {
      get sorting() {
        return sorting
      },
    },
    onSortingChange: (updater: Updater<SortingState>) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      todoFilters.setFilters({ sort: toTodoSort(next) })
    },
  })
</script>

{#if todos.length === 0}
  <div class="flex flex-col items-center gap-1 py-10 text-center">
    <IconClipboardList class="text-muted size-10" />
    <p class="text-muted">Nenhuma tarefa ainda.</p>
    <p class="text-muted text-sm">Crie manualmente ou peça uma sugestão à IA.</p>
  </div>
{:else if filteredTodos.length === 0}
  <div class="flex flex-col items-center gap-3 py-10 text-center">
    <IconFilterOff class="text-muted size-10" />
    <p class="text-muted">Nenhuma tarefa corresponde aos filtros.</p>
    <button type="button" class="btn preset-tonal" onclick={todoFilters.clearFilters}>
      <IconFilterOff class="size-4" />
      Limpar filtros
    </button>
  </div>
{:else}
  <div class="flex flex-col gap-2">
    {#if todoFilters.isFiltered}
      <p class="text-muted text-sm">{filteredTodos.length} de {todos.length} tarefas</p>
    {/if}

    <div class="table-wrap">
      <table class="table">
        <thead>
          {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
            <tr>
              {#each headerGroup.headers as header (header.id)}
                <th>
                  {#if !header.isPlaceholder}
                    <FlexRender {header} />
                  {/if}
                </th>
              {/each}
            </tr>
          {/each}
        </thead>
        <tbody>
          {#each table.getRowModel().rows as row (row.id)}
            <tr>
              {#each row.getAllCells() as cell (cell.id)}
                <td>
                  <FlexRender {cell} />
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}
