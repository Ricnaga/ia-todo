<script setup lang="ts">
withDefaults(defineProps<{ lines?: number; rowHeight?: number }>(), {
  lines: 3,
  rowHeight: 16,
})
</script>

<template>
  <div role="status" aria-busy="true" class="flex flex-col gap-2.5">
    <USkeleton
      v-for="index in lines"
      :key="index"
      :style="{ height: `${rowHeight}px` }"
      class="rounded-sm"
    />
  </div>
</template>
