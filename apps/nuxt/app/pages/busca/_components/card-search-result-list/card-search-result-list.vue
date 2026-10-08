<script setup lang="ts">
import type { Assistant, Criteria } from '@ia-task-manager/schemas/assistant'
import { priorityColors, priorityLabels } from '~/lib/constants/todo.constants'
import { paths } from '~/lib/constants/paths'

defineProps<{ result: Assistant | null; isPending: boolean }>()

const statusLabels: Record<Criteria['status'], string> = {
  any: 'qualquer',
  pending: 'pendente',
  completed: 'concluída',
}

const dueLabels: Record<Criteria['due'], string> = {
  any: 'qualquer',
  today: 'hoje',
  thisWeek: 'esta semana',
  overdue: 'atrasada',
  none: 'sem data',
}

function formatCriteria(criteria: Criteria): string {
  const parts: string[] = []
  if (criteria.keywords.length > 0) {
    parts.push(criteria.keywords.map((keyword) => `“${keyword}”`).join(', '))
  }
  parts.push(statusLabels[criteria.status])
  if (criteria.priority !== 'any') {
    parts.push(`prioridade ${priorityLabels[criteria.priority]}`)
  }
  parts.push(`vencimento ${dueLabels[criteria.due]}`)
  return parts.join(' · ')
}
</script>

<template>
  <UCard v-if="isPending">
    <SkeletonStack :row-height="18" />
  </UCard>

  <EmptyState v-else-if="!result" message="Descreva uma busca para começar." />

  <EmptyState v-else-if="result.todos.length === 0" message="Nenhuma tarefa corresponde à busca." />

  <UCard v-else class="animate-in fade-in slide-in-from-bottom-2 duration-base ease-entrance">
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-1.5">
        <span class="text-dimmed text-xs font-semibold">Filtros entendidos:</span>
        <UBadge color="neutral" variant="soft" size="sm">
          {{ formatCriteria(result.criteria) }}
        </UBadge>
      </div>

      <div class="flex flex-col gap-2">
        <UCard v-for="todo in result.todos" :key="todo.id">
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 flex-col gap-0.5">
              <p class="font-semibold" :class="{ 'line-through': todo.completed }">
                {{ todo.title }}
              </p>
              <p v-if="todo.description" class="text-dimmed line-clamp-1 text-sm">
                {{ todo.description }}
              </p>
            </div>
            <UBadge :color="priorityColors[todo.priority]" variant="soft" size="sm">
              {{ priorityLabels[todo.priority] }}
            </UBadge>
          </div>
        </UCard>
      </div>

      <p class="text-dimmed text-xs">
        <NuxtLink :to="paths.TAREFAS" class="underline">Ver todas as tarefas</NuxtLink>
        · {{ result.todos.length }} resultado(s)
      </p>
    </div>
  </UCard>
</template>
