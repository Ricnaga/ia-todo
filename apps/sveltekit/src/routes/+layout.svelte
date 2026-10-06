<script lang="ts">
  import favicon from '$lib/assets/favicon.svg'
  import Toaster from '$lib/components/Toaster.svelte'
  import './layout.css'

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<Toaster />
