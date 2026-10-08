<script setup lang="ts">
defineProps<{ message: string }>()
</script>

<template>
  <p class="text-dimmed text-sm">{{ message }}</p>
</template>
