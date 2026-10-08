<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation'
  import { resolve } from '$app/paths'
  import { page } from '$app/state'
  import ErrorState from '$lib/components/error-state/error-state.svelte'
  import { paths } from '$lib/constants/paths'

  const isNotFound = $derived(page.status === 404)
  const title = $derived(isNotFound ? 'Página não encontrada' : 'Erro ao carregar')
  const retryLabel = $derived(isNotFound ? 'Voltar ao início' : 'Tentar novamente')
  const message = $derived(import.meta.env.DEV ? page.error?.message : undefined)

  if (page.error) {
    console.error(page.error)
  }

  async function handleRetry(): Promise<void> {
    if (isNotFound) {
      await goto(resolve(paths.HOME))
      return
    }

    await invalidateAll()
  }
</script>

<div class="mx-auto max-w-3xl px-4 py-6">
  <ErrorState {title} {message} {retryLabel} retry onretry={handleRetry} />
</div>
