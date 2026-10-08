<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string
    title?: string
    message?: string
    retry?: boolean
    retryLabel?: string
  }>(),
  {
    icon: 'i-tabler:alert-circle',
    title: 'Erro ao carregar',
    message: undefined,
    retry: false,
    retryLabel: 'Tentar novamente',
  },
)

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div role="alert" class="flex flex-col items-center justify-center gap-2 py-10 text-center">
    <span class="bg-error-soft text-error flex size-12 items-center justify-center rounded-full">
      <UIcon :name="icon" class="size-7" />
    </span>
    <p class="text-highlighted text-lg font-semibold">{{ title }}</p>
    <p v-if="message" class="text-dimmed max-w-sm text-sm">{{ message }}</p>
    <UButton v-if="retry" color="error" variant="soft" class="mt-2" @click="emit('retry')">
      {{ retryLabel }}
    </UButton>
  </div>
</template>
