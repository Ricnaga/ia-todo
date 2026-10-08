<script lang="ts">
  import { IconSparkles } from '@tabler/icons-svelte'
  import CardDaySummaryContent from './card-day-summary-content/card-day-summary-content.svelte'
  import EmptyState from '$lib/components/empty-state/empty-state.svelte'
  import { useSummarizeDayMutation } from '$lib/services/insights/insights.mutation'
  import { notifyError } from '$lib/utils/notifications'

  const summaryMutation = useSummarizeDayMutation()

  const summary = $derived(summaryMutation.data)
  const isPending = $derived(summaryMutation.isPending)
  const error = $derived(summaryMutation.error)

  function handleGenerate(): void {
    summaryMutation.mutate(undefined, {
      onError: (failure) => notifyError('Não consegui gerar o resumo')(failure),
    })
  }
</script>

<div class="flex flex-col gap-4">
  <div class="flex justify-end">
    <button
      type="button"
      class="btn preset-filled-primary-500"
      aria-busy={isPending}
      disabled={isPending}
      onclick={handleGenerate}
    >
      <IconSparkles class="size-[18px]" />
      {summary ? 'Gerar novo resumo' : 'Gerar resumo'}
    </button>
  </div>

  {#if error}
    <p class="text-error text-sm">
      Não foi possível gerar o resumo agora. Verifique a configuração da IA e tente novamente.
    </p>
  {/if}

  <CardDaySummaryContent {summary} {isPending} />

  {#if !summary && !isPending}
    <EmptyState message="Gere um resumo para ver o plano de execução do dia." />
  {/if}
</div>
