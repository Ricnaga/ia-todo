<script setup lang="ts">
import { computed } from 'vue'
import { priorityLabels } from '~/lib/constants/todo.constants'
import { TODO_PRIORITY_FILTERS, TODO_STATUS_FILTERS } from '~/lib/todo/todo-filters'
import type { TodoPriorityFilter, TodoStatusFilter } from '~/lib/todo/todo-filters'
import { useTodoFilters } from '~/lib/todo/use-todo-filters'

const { filters, setFilters, clearFilters, isFiltered } = useTodoFilters()

const statusOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'completed', label: 'Concluídas' },
]

const priorityOptions = computed(() =>
  TODO_PRIORITY_FILTERS.map((value) => ({
    value,
    label: value === 'all' ? 'Todas' : priorityLabels[value],
  })),
)

function toStatus(value: string): TodoStatusFilter {
  return TODO_STATUS_FILTERS.find((option) => option === value) ?? 'all'
}

function toPriority(value: string): TodoPriorityFilter {
  return TODO_PRIORITY_FILTERS.find((option) => option === value) ?? 'all'
}

function onQueryChange(value: unknown) {
  setFilters({ q: typeof value === 'string' ? value : '' })
}

function onStatusChange(value: unknown) {
  setFilters({ status: toStatus(typeof value === 'string' ? value : 'all') })
}

function onPriorityChange(value: unknown) {
  setFilters({ priority: toPriority(typeof value === 'string' ? value : 'all') })
}
</script>

<template>
  <div class="flex flex-wrap items-end gap-3">
    <UFormField label="Buscar" class="w-full sm:w-70">
      <UInput
        :model-value="filters.q"
        icon="i-tabler:search"
        class="w-full"
        placeholder="Título ou descrição"
        @update:model-value="onQueryChange"
      />
    </UFormField>

    <UFormField label="Status" class="w-40">
      <USelect
        :model-value="filters.status"
        :options="statusOptions"
        class="w-full"
        @update:model-value="onStatusChange"
      />
    </UFormField>

    <UFormField label="Prioridade" class="w-40">
      <USelect
        :model-value="filters.priority"
        :options="priorityOptions"
        class="w-full"
        @update:model-value="onPriorityChange"
      />
    </UFormField>

    <UButton
      v-if="isFiltered"
      icon="i-tabler:filter-off"
      variant="subtle"
      color="neutral"
      @click="clearFilters"
    >
      Limpar filtros
    </UButton>
  </div>
</template>
