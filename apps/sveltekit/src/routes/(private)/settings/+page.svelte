<script lang="ts">
  import { invalidate } from '$app/navigation'
  import ErrorState from '$lib/components/ErrorState.svelte'
  import SettingsPanel from '$lib/components/SettingsPanel.svelte'
  import SkeletonAccounts from '$lib/components/SkeletonAccounts.svelte'
  import SkeletonSessions from '$lib/components/SkeletonSessions.svelte'
  import { authQueryKeys } from '$lib/services/auth/auth.keys'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
  let isRetrying = $state(false)

  async function handleRetry(): Promise<void> {
    isRetrying = true
    try {
      await Promise.all(authQueryKeys.writeTargets().map((key) => invalidate(key)))
    } finally {
      isRetrying = false
    }
  }
</script>

<svelte:head>
  <title>Configurações | ia-task-manager</title>
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
    <div class="flex flex-col gap-4">
      <SkeletonAccounts />
      <SkeletonSessions />
    </div>
  {:else}
    <SettingsPanel user={data.user} accounts={data.accounts} sessions={data.sessions} />
  {/if}
</div>
