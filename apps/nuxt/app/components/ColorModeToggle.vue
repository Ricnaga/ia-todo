<script setup lang="ts">
/**
 * Alterna light/dark.
 *
 * `useColorMode` vem do `@nuxtjs/color-mode`, declarado direto no
 * `nuxt.config.ts` em vez de herdado pelo `@nuxt/ui`, e escreve a classe `dark`
 * no <html>, que e um dos seletores que o
 * `modes.css` escuta. O provider e a UI nao reescrevem `data-mode`, entao nao
 * ha duas fontes de verdade para divergirem.
 *
 * Na v4 o composable expoe `preference` (o que foi escolhido, `light`, `dark`
 * ou `system`) e `value` (ja resolvido), sem metodo `toggle`. Alternar e
 * escrever em `preference`: e o plugin do cliente que observa esse campo para
 * reaplicar a classe, e resolver por `value` evita o caso de `preference`
 * estar em `system` e o clique não mudar nada.
 *
 * O icone e escolhido por CSS (`dark:hidden` / `hidden dark:inline`) em vez de
 * JS: `colorMode.unknown` e `true` no servidor, e decidir o icone no cliente
 * produziria hydration mismatch. Como o `dark` do Tailwind le a mesma classe
 * que o `color-mode` escreve, CSS e JS nunca discordam.
 */
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
