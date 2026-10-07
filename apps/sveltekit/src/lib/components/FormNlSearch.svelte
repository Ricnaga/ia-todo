<script lang="ts">
  import { IconSearch } from '@tabler/icons-svelte'
  import CardSearchResultList from '$lib/components/CardSearchResultList.svelte'
  import { useNlSearchMutation } from '$lib/services/assistant/assistant.mutation'
  import { notifyError } from '$lib/utils/notifications'

  const searchMutation = useNlSearchMutation()

  let query = $state('')

  const result = $derived(searchMutation.data)
  const isPending = $derived(searchMutation.isPending)
  const canSearch = $derived(query.trim().length > 0)

  function handleSearch(): void {
    if (!query.trim()) return
    searchMutation.mutate(query, { onError: notifyError('Não consegui buscar') })
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return
    handleSearch()
  }
</script>

<div class="flex max-w-4xl flex-col gap-4">
  <div>
    <h1 class="text-fg text-3xl/tight font-bold">Busca em linguagem natural</h1>
    <p class="text-muted text-sm">
      Descreva o que procura em texto livre — a IA converte em filtros e aplica sobre suas tarefas.
    </p>
  </div>

  <div class="flex items-center gap-3">
    <div class="relative flex-1">
      <input
        type="text"
        class="input pr-12"
        placeholder="Ex.: consultas de amanhã de alta prioridade"
        aria-label="Descreva o que procura"
        bind:value={query}
        onkeydown={handleKeydown}
      />
      <kbd
        class="border-line bg-surface text-muted pointer-events-none absolute inset-y-0 right-2 flex items-center rounded border px-1.5 text-xs"
      >
        ↵
      </kbd>
    </div>

    <button
      type="button"
      class="btn preset-filled-primary-500"
      aria-busy={isPending}
      disabled={!canSearch || isPending}
      onclick={handleSearch}
    >
      <IconSearch class="size-[18px]" />
      Buscar
    </button>
  </div>

  <CardSearchResultList {result} {isPending} />
</div>
