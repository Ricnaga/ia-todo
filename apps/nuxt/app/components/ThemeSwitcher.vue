<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { computed } from 'vue'
import { useColorMode } from '#imports'

const colorMode = useColorMode()

const options = [
  { value: 'auto', label: 'Sistema', icon: 'i-tabler:device-desktop' },
  { value: 'light', label: 'Claro', icon: 'i-tabler:sun' },
  { value: 'dark', label: 'Escuro', icon: 'i-tabler:moon' },
] as const

const items = computed<DropdownMenuItem[]>(() => [
  { label: 'Tema', type: 'label' },
  ...options.map((option) => ({
    label: option.label,
    icon: option.icon,
    type: 'checkbox' as const,
    checked: colorMode.preference === option.value,
    onSelect: (event: Event) => event.preventDefault(),
    onUpdateChecked: () => {
      colorMode.preference = option.value
    },
  })),
])
</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'end', collisionPadding: 12 }">
    <UButton
      color="neutral"
      variant="ghost"
      aria-label="Alternar tema"
      title="Alternar tema"
      square
    >
      <span aria-hidden="true" class="dark:hidden"
        ><UIcon name="i-tabler:sun" class="size-5"
      /></span>
      <span aria-hidden="true" class="hidden dark:inline"
        ><UIcon name="i-tabler:moon" class="size-5"
      /></span>
    </UButton>
  </UDropdownMenu>
</template>
