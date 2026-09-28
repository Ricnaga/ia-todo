<script setup lang="ts">
/**
 * Alterna light/dark.
 *
 * `useColorMode` vem do `@nuxtjs/color-mode` (instalado como dependencia do
 * `@nuxt/ui`) e escreve a classe `dark` no <html>, que e um dos seletores que o
 * `modes.css` escuta. O provider e a UI nao reescrevem `data-mode`, entao nao
 * ha duas fontes de verdade para divergirem.
 *
 * O icone e escolhido por CSS (`dark:hidden` / `hidden dark:inline`) em vez de
 * JS: `colorMode.unknown` e `true` no servidor, e decidir o icone no cliente
 * produziria hydration mismatch. Como o `dark` do Tailwind le a mesma classe
 * que o `color-mode` escreve, CSS e JS nunca discordam.
 */
const colorMode = useColorMode()
</script>

<template>
  <UButton
    color="neutral"
    variant="ghost"
    aria-label="Alternar tema"
    title="Alternar tema"
    @click="colorMode.toggle()"
  >
    <span aria-hidden="true" class="dark:hidden">☀</span>
    <span aria-hidden="true" class="hidden dark:inline">☾</span>
  </UButton>
</template>
