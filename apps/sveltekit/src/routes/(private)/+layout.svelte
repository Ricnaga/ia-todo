<script lang="ts">
  import NavShell from '$lib/components/NavShell.svelte'
  import type { LayoutProps } from './$types'

  let { data, children }: LayoutProps = $props()
</script>

<NavShell user={data.user}>
  {@render children()}
</NavShell>
