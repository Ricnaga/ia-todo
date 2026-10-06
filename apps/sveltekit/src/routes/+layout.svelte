<script lang="ts">
  import { navigating } from '$app/state'
  import favicon from '$lib/assets/favicon.svg'
  import Toaster from '$lib/components/Toaster.svelte'
  import './layout.css'

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{#if navigating}
  <div class="bg-accent fixed inset-x-0 top-0 z-50 h-0.5 animate-pulse" aria-hidden="true"></div>
{/if}

{@render children()}

<Toaster />
