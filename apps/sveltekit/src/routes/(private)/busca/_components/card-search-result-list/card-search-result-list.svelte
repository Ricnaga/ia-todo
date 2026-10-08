<script lang="ts">
  import { resolve } from '$app/paths'
  import EmptyState from '$lib/components/empty-state/empty-state.svelte'
  import SkeletonStack from '$lib/components/skeleton-stack/skeleton-stack.svelte'
  import { paths } from '$lib/constants/paths'
  import { priorityColors, priorityLabels } from '$lib/constants/todo.constants'
  import type { Assistant, Criteria } from '@ia-task-manager/schemas/assistant'

  interface Props {
    result: Assistant | null
    isPending: boolean
  }

  let { result, isPending }: Props = $props()

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

{#if isPending}
  <div class="card border-line bg-surface border p-6">
    <SkeletonStack rowHeight={18} />
  </div>
{:else if !result}
  <EmptyState message="Descreva uma busca para começar." />
{:else if result.todos.length === 0}
  <EmptyState message="Nenhuma tarefa corresponde à busca." />
{:else}
  <div class="card border-line bg-surface flex flex-col gap-4 border p-6">
    <div class="flex items-center gap-1.5">
      <span class="text-muted text-xs font-semibold">Filtros entendidos:</span>
      <span class="badge preset-tonal">{formatCriteria(result.criteria)}</span>
    </div>

    <div class="flex flex-col gap-2">
      {#each result.todos as todo (todo.id)}
        <div class="card border-line bg-surface flex items-start justify-between gap-3 border p-4">
          <div class="flex min-w-0 flex-col gap-0.5">
            <p class="font-semibold" class:line-through={todo.completed}>{todo.title}</p>
            {#if todo.description}
              <p class="text-muted line-clamp-1 text-sm">{todo.description}</p>
            {/if}
          </div>
          <span class="badge shrink-0 {priorityColors[todo.priority]}">
            {priorityLabels[todo.priority]}
          </span>
        </div>
      {/each}
    </div>

    <p class="text-muted text-xs">
      <a href={resolve(paths.TAREFAS)} class="underline">Ver todas as tarefas</a>
      · {result.todos.length} resultado(s)
    </p>
  </div>
{/if}
