<script lang="ts">
  import { IconFilterOff, IconSearch } from '@tabler/icons-svelte'
  import { priorityLabels } from '$lib/constants/todo.constants'
  import {
    TODO_PRIORITY_FILTERS,
    TODO_STATUS_FILTERS,
    type TodoPriorityFilter,
    type TodoStatusFilter,
  } from '$lib/todo/todo-filters'
  import { useTodoFilters } from '$lib/todo/use-todo-filters'

  const todoFilters = useTodoFilters()

  const statusOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'completed', label: 'Concluídas' },
  ]

  const priorityOptions = TODO_PRIORITY_FILTERS.map((value) => ({
    value,
    label: value === 'all' ? 'Todas' : priorityLabels[value],
  }))

  function toStatus(value: string): TodoStatusFilter {
    return (TODO_STATUS_FILTERS as readonly string[]).includes(value)
      ? (value as TodoStatusFilter)
      : 'all'
  }

  function toPriority(value: string): TodoPriorityFilter {
    return (TODO_PRIORITY_FILTERS as readonly string[]).includes(value)
      ? (value as TodoPriorityFilter)
      : 'all'
  }

  function onQueryChange(event: Event): void {
    const target = event.currentTarget as HTMLInputElement
    todoFilters.setFilters({ q: target.value })
  }

  function onStatusChange(event: Event): void {
    const target = event.currentTarget as HTMLSelectElement
    todoFilters.setFilters({ status: toStatus(target.value) })
  }

  function onPriorityChange(event: Event): void {
    const target = event.currentTarget as HTMLSelectElement
    todoFilters.setFilters({ priority: toPriority(target.value) })
  }
</script>

<div class="flex flex-wrap items-end gap-3">
  <div class="flex w-full flex-col gap-1 sm:w-70">
    <label class="label-text" for="todo-filter-query">Buscar</label>
    <div class="relative">
      <IconSearch
        class="text-muted pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
      />
      <input
        id="todo-filter-query"
        type="text"
        class="input pl-9"
        placeholder="Título ou descrição"
        value={todoFilters.filters.q}
        oninput={onQueryChange}
      />
    </div>
  </div>

  <div class="flex w-40 flex-col gap-1">
    <label class="label-text" for="todo-filter-status">Status</label>
    <select
      id="todo-filter-status"
      class="select"
      value={todoFilters.filters.status}
      onchange={onStatusChange}
    >
      {#each statusOptions as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </div>

  <div class="flex w-40 flex-col gap-1">
    <label class="label-text" for="todo-filter-priority">Prioridade</label>
    <select
      id="todo-filter-priority"
      class="select"
      value={todoFilters.filters.priority}
      onchange={onPriorityChange}
    >
      {#each priorityOptions as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </div>

  {#if todoFilters.isFiltered}
    <button type="button" class="btn preset-tonal" onclick={todoFilters.clearFilters}>
      <IconFilterOff class="size-4" />
      Limpar filtros
    </button>
  {/if}
</div>
