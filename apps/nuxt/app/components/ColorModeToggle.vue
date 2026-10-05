<script setup lang="ts">
const colorMode = useColorMode()

const alternar = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <UButton
    color="neutral"
    variant="ghost"
    aria-label="Alternar tema"
    title="Alternar tema"
    @click="alternar"
  >
    <span aria-hidden="true" class="dark:hidden">☀</span>
    <span aria-hidden="true" class="hidden dark:inline">☾</span>
  </UButton>
</template>
