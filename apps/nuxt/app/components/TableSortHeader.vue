<script setup lang="ts">
import { computed } from 'vue'
import type { Header } from '@tanstack/vue-table'
import type { Todo } from '@ia-task-manager/schemas/todo'

const props = defineProps<{ header: Header<Todo, unknown>; label: string }>()

const sorted = computed(() => props.header.column.getIsSorted())

function toggle(event: MouseEvent) {
  props.header.column.getToggleSortingHandler()?.(event)
}
</script>

<template>
  <button
    type="button"
    class="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
    @click="toggle"
  >
    <span>{{ label }}</span>
    <UIcon v-if="sorted === 'asc'" name="i-tabler:arrow-up" class="size-3.5" />
    <UIcon v-else-if="sorted === 'desc'" name="i-tabler:arrow-down" class="size-3.5" />
    <UIcon v-else name="i-tabler:arrows-sort" class="size-3.5 opacity-40" />
  </button>
</template>
