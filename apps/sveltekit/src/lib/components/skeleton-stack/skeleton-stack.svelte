<script lang="ts">
  interface Props {
    lines?: number
    rowHeight?: number
  }

  let { lines = 3, rowHeight = 16 }: Props = $props()
</script>

<div role="status" aria-busy="true" class="flex flex-col gap-2">
  {#each Array.from({ length: lines }, (_value, index) => index) as index (index)}
    <div class="bg-surface-200-800 animate-pulse rounded" style="height: {rowHeight}px"></div>
  {/each}
</div>
