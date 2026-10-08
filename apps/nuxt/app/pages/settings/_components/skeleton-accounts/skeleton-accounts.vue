<template>
  <div role="status" aria-busy="true" class="flex flex-col gap-3">
    <div v-for="index in 2" :key="index" class="flex items-center gap-3">
      <USkeleton class="size-[18px] rounded-full" />
      <USkeleton class="h-3.5 w-18" />
      <USkeleton class="ml-auto h-3.5 w-18" />
    </div>
  </div>
</template>
