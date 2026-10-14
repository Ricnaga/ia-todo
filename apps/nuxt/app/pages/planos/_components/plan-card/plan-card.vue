<script setup lang="ts">
defineProps<{
  title: string
  price: string
  priceCaption: string
  features: readonly string[]
  ctaLabel: string
  highlighted?: boolean
  badge?: string
  ctaDisabled?: boolean
  ctaLoading?: boolean
}>()

const emit = defineEmits<{ cta: [] }>()
</script>

<template>
  <UCard class="h-full" :class="highlighted ? 'border-accent border-2' : undefined">
    <div class="flex h-full flex-col gap-4">
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-highlighted text-lg font-semibold">{{ title }}</h2>
        <UBadge v-if="badge" color="primary" variant="soft">{{ badge }}</UBadge>
      </div>

      <slot />

      <div>
        <p class="text-highlighted text-2xl font-bold">{{ price }}</p>
        <p class="text-dimmed text-xs">{{ priceCaption }}</p>
      </div>

      <ul class="flex flex-col gap-2">
        <li v-for="feature in features" :key="feature" class="flex items-start gap-2">
          <UIcon name="i-tabler:check" class="text-primary mt-0.5 size-4 shrink-0" />
          <span class="text-sm">{{ feature }}</span>
        </li>
      </ul>

      <UButton
        class="mt-auto justify-center"
        block
        :variant="highlighted ? 'solid' : 'soft'"
        :disabled="ctaDisabled"
        :loading="ctaLoading"
        @click="emit('cta')"
      >
        {{ ctaLabel }}
      </UButton>
    </div>
  </UCard>
</template>
