<script lang="ts">
  import SkeletonStack from '$lib/components/skeleton-stack/skeleton-stack.svelte'
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-col gap-1">
    <div class="bg-surface-200-800 animate-pulse rounded" style="height: 28px; width: 120px;"></div>
    <div class="bg-surface-200-800 animate-pulse rounded" style="height: 14px; width: 320px;"></div>
  </div>
  <SkeletonStack lines={6} rowHeight={24} />
</div>
