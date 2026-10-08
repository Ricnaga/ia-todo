<script lang="ts">
  import type { Snippet } from 'svelte'
  import RenderBoundary from './render-boundary.svelte'

  let {
    status,
    errorMessage,
    retryLabel,
    onretry,
    children,
    fallback,
    errorSnippet,
  }: {
    status: 'pending' | 'error' | 'ready'
    errorMessage?: string
    retryLabel?: string
    onretry?: () => void
    children: Snippet
    fallback?: Snippet
    errorSnippet?: Snippet
  } = $props()
</script>

<RenderBoundary {status} {errorMessage} {retryLabel} {onretry} {fallback} {errorSnippet}>
  {@render children()}
</RenderBoundary>
