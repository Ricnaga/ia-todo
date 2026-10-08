<script setup lang="ts">
const props = defineProps<{
  label: string
  icon: string
  linked: boolean
  busy: boolean
}>()

const emit = defineEmits<{ link: []; unlink: [] }>()
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-2">
    <div class="flex min-w-0 items-center gap-3">
      <UIcon :name="props.icon" class="size-[18px] shrink-0" />
      <span>{{ props.label }}</span>
      <UBadge v-if="props.linked" color="success" variant="soft" size="sm">Vinculada</UBadge>
      <UBadge v-else color="neutral" variant="outline" size="sm">Não vinculada</UBadge>
    </div>

    <UButton
      v-if="props.linked"
      icon="i-tabler:link-off"
      size="xs"
      color="error"
      variant="soft"
      :loading="props.busy"
      @click="emit('unlink')"
    >
      Desvincular
    </UButton>
    <UButton v-else icon="i-tabler:external-link" size="xs" variant="soft" @click="emit('link')">
      Vincular
    </UButton>
  </div>
</template>
