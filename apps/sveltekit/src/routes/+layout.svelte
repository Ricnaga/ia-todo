<script lang="ts">
  import favicon from '$lib/assets/favicon.svg'
  import ColorModeToggle from '$lib/components/ColorModeToggle.svelte'
  import './layout.css'

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col">
  <header class="flex items-center justify-end p-4">
    <ColorModeToggle />
  </header>
  <main class="flex-1">
    {@render children()}
  </main>
</div>
