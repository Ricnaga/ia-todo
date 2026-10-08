<script setup lang="ts">
const props = defineProps<{
  status: 'pending' | 'error' | 'ready'
  errorMessage?: string
  retryLabel?: string
  retry?: boolean
}>()

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <RenderBoundary v-bind="props" v-on="$attrs" @retry="emit('retry')">
    <slot />
    <template #errorSnippet><slot name="errorSnippet" /></template>
    <template #fallback><slot name="fallback" /></template>
  </RenderBoundary>
</template>
