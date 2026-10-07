<script setup lang="ts">
import type { DaySummary } from '@ia-task-manager/schemas/insights'

defineProps<{ summary?: DaySummary; isPending: boolean }>()
</script>

<template>
  <UCard v-if="isPending">
    <SkeletonStack :row-height="14" />
  </UCard>

  <UCard v-else-if="summary">
    <div class="flex flex-col gap-4">
      <p>{{ summary.summary }}</p>

      <div>
        <div class="mb-1.5 flex items-center gap-2">
          <span
            class="bg-accent-soft text-accent flex size-5 items-center justify-center rounded-full"
          >
            <UIcon name="i-tabler:circle-check" class="size-4" />
          </span>
          <p class="text-sm font-semibold">Foco principal</p>
        </div>
        <p class="text-dimmed text-sm">{{ summary.focus }}</p>
      </div>

      <div v-if="summary.suggestedOrder.length > 0">
        <p class="mb-1.5 text-sm font-semibold">Ordem sugerida</p>
        <ul class="list-disc ps-5">
          <li v-for="item in summary.suggestedOrder" :key="item" class="text-sm">
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
  </UCard>
</template>
