<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <div
    class="animate-in fade-in duration-slow ease-entrance flex min-h-svh items-center justify-center px-4 py-10"
  >
    <UCard class="w-full max-w-md">
      <h2 class="text-highlighted mb-6 text-2xl font-semibold">
        {{ title }}
      </h2>
      <slot />
    </UCard>
  </div>
</template>
