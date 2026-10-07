<script lang="ts">
  import { IconCircleCheck } from '@tabler/icons-svelte'
  import SkeletonStack from '$lib/components/SkeletonStack.svelte'
  import type { DaySummary } from '@ia-task-manager/schemas/insights'

  interface Props {
    summary?: DaySummary | null
    isPending: boolean
  }

  let { summary, isPending }: Props = $props()
</script>

{#if isPending}
  <div class="card border-line bg-surface border p-6">
    <SkeletonStack rowHeight={14} />
  </div>
{:else if summary}
  <div class="card border-line bg-surface flex flex-col gap-4 border p-6">
    <p>{summary.summary}</p>

    <div>
      <div class="mb-1.5 flex items-center gap-2">
        <span
          class="bg-accent-soft text-accent flex size-5 items-center justify-center rounded-full"
        >
          <IconCircleCheck class="size-4" />
        </span>
        <p class="text-sm font-semibold">Foco principal</p>
      </div>
      <p class="text-muted text-sm">{summary.focus}</p>
    </div>

    {#if summary.suggestedOrder.length > 0}
      <div>
        <p class="mb-1.5 text-sm font-semibold">Ordem sugerida</p>
        <ul class="flex list-disc flex-col gap-2 pl-5">
          {#each summary.suggestedOrder as item (item)}
            <li class="text-sm">{item}</li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
{/if}
