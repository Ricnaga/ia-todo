<script setup lang="ts">
defineProps<{
  status: 'pending' | 'error' | 'ready'
  errorMessage?: string
  retryLabel?: string
  retry?: boolean
}>()

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <ErrorState
    v-if="status === 'error' && !$slots.errorSnippet"
    :message="errorMessage"
    :retry="retry"
    :retry-label="retryLabel"
    @retry="emit('retry')"
  />

  <slot v-else-if="status === 'error'" name="errorSnippet" />
  <slot v-else-if="status === 'pending'" name="fallback">
    <SkeletonStack />
  </slot>
  <slot v-else />
</template>
