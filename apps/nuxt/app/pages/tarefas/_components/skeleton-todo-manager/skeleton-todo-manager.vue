<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <USkeleton class="h-6 w-40" />
        <USkeleton class="h-3 w-50" />
      </div>
      <div class="flex gap-2">
        <USkeleton class="h-9 w-38" />
        <USkeleton class="h-9 w-32" />
      </div>
    </div>
    <SkeletonStack :lines="8" :row-height="36" />
  </div>
</template>
