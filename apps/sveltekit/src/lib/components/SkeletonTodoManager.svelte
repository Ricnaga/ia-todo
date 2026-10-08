<script lang="ts">
  import SkeletonStack from '$lib/components/SkeletonStack.svelte'
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div class="flex flex-col gap-1">
      <div
        class="bg-surface-200-800 animate-pulse rounded"
        style="height: 24px; width: 160px;"
      ></div>
      <div
        class="bg-surface-200-800 animate-pulse rounded"
        style="height: 12px; width: 200px;"
      ></div>
    </div>
    <div class="flex gap-2">
      <div
        class="bg-surface-200-800 animate-pulse rounded"
        style="height: 36px; width: 152px;"
      ></div>
      <div
        class="bg-surface-200-800 animate-pulse rounded"
        style="height: 36px; width: 128px;"
      ></div>
    </div>
  </div>
  <SkeletonStack lines={8} rowHeight={36} />
</div>
