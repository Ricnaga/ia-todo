<div role="status" aria-busy="true" class="flex flex-col gap-3">
  {#each [0, 1] as index (index)}
    <div class="flex items-center gap-3">
      <div class="bg-surface-200-800 size-[18px] animate-pulse rounded-full"></div>
      <div
        class="bg-surface-200-800 animate-pulse rounded"
        style="height: 14px; width: 160px"
      ></div>
      <div
        class="bg-surface-200-800 ml-auto animate-pulse rounded"
        style="height: 14px; width: 48px"
      ></div>
    </div>
  {/each}
</div>
