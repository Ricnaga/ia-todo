<script lang="ts">
  import { invalidate } from '$app/navigation'
  import ContentTodoManager from './_components/content-todo-manager/content-todo-manager.svelte'
  import ErrorState from '$lib/components/error-state/error-state.svelte'
  import SkeletonTodoManager from './_components/skeleton-todo-manager/skeleton-todo-manager.svelte'
  import { todoQueryKeys } from '$lib/services/todo/todo.keys'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let isRetrying = $state(false)

  async function handleRetry(): Promise<void> {
    isRetrying = true
    try {
      await invalidate(todoQueryKeys.all)
    } finally {
      isRetrying = false
    }
  }
</script>

<svelte:head>
  <title>Tarefas | ia-task-manager</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6">
  {#if data.loadError && !isRetrying}
    <ErrorState
      retry
      title="Erro ao carregar"
      retryLabel="Tentar novamente"
      message={data.loadError}
      onretry={handleRetry}
    />
  {:else if isRetrying}
    <SkeletonTodoManager />
  {:else}
    <ContentTodoManager todos={data.todos} />
  {/if}
</div>
