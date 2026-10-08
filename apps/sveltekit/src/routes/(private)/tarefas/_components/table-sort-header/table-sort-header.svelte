<script lang="ts">
  import { IconArrowDown, IconArrowUp, IconArrowsSort } from '@tabler/icons-svelte'
  import type { SortDirection } from '@tanstack/svelte-table'

  interface Props {
    label: string
    sorted: SortDirection | false
    ontoggle: (event: MouseEvent) => void
  }

  let { label, sorted, ontoggle }: Props = $props()
</script>

<button
  type="button"
  class="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
  onclick={ontoggle}
>
  <span>{label}</span>
  {#if sorted === 'asc'}
    <IconArrowUp class="size-3.5" />
  {:else if sorted === 'desc'}
    <IconArrowDown class="size-3.5" />
  {:else}
    <IconArrowsSort class="size-3.5 opacity-40" />
  {/if}
</button>
