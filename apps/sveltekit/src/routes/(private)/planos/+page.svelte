<script lang="ts">
  import { invalidate } from '$app/navigation'
  import ErrorState from '$lib/components/error-state/error-state.svelte'
  import SkeletonPlanManager from './_components/skeleton-plan-manager/skeleton-plan-manager.svelte'
  import PlanManager from './_components/plan-manager/plan-manager.svelte'
  import { billingQueryKeys } from '$lib/services/billing/billing.keys'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let isRetrying = $state(false)

  async function handleRetry(): Promise<void> {
    isRetrying = true
    try {
      await invalidate(billingQueryKeys.subscription)
    } finally {
      isRetrying = false
    }
  }
</script>

<svelte:head>
  <title>Planos | ia-task-manager</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
  {#if data.loadError && !isRetrying}
    <ErrorState
      retry
      title="Erro ao carregar"
      retryLabel="Tentar novamente"
      message={data.loadError}
      onretry={handleRetry}
    />
  {:else if isRetrying}
    <SkeletonPlanManager />
  {:else if data.subscription}
    <PlanManager subscription={data.subscription} />
  {/if}
</div>
