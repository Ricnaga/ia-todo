<script lang="ts">
  import { invalidate } from '$app/navigation'
  import ErrorState from '$lib/components/error-state/error-state.svelte'
  import SettingsPanel from './_components/settings-panel/settings-panel.svelte'
  import SkeletonAccounts from './_components/skeleton-accounts/skeleton-accounts.svelte'
  import SkeletonSessions from './_components/skeleton-sessions/skeleton-sessions.svelte'
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
