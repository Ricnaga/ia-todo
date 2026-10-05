<script lang="ts">
  import { colorMode } from '$lib/color-mode.svelte'
</script>

<button
  type="button"
  class="btn preset-tonal"
  aria-label="Alternar tema"
  title="Alternar tema"
  onclick={() => colorMode.toggle()}
>
  <span aria-hidden="true" class="dark:hidden">☀</span>
  <span aria-hidden="true" class="hidden dark:inline">☾</span>
</button>
