<script lang="ts">
  import type { Snippet } from 'svelte'

  let { title, children }: { title: string; children: Snippet } = $props()
</script>

<div class="flex min-h-svh items-center justify-center px-4 py-10">
  <div class="card border-line bg-surface w-full max-w-md border p-6">
    <h2 class="text-fg mb-6 text-2xl font-semibold">{title}</h2>
    {@render children()}
  </div>
</div>
