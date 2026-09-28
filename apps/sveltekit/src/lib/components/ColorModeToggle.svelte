<script lang="ts">
	import { colorMode } from '$lib/color-mode.svelte';
</script>

<!--
	O icone e escolhido por CSS (`dark:hidden` / `hidden dark:inline`) em vez de
	JS: no servidor o modo e desconhecido, e decidir o icone so no cliente
	produziria hydration mismatch. Como o `dark` do Tailwind le o mesmo atributo
	que este app escreve, CSS e JS nunca discordam.
-->
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
