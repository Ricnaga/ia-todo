<script lang="ts">
  import type { Snippet } from 'svelte'
  import ErrorState from '../error-state/error-state.svelte'
  import SkeletonStack from '../skeleton-stack/skeleton-stack.svelte'

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

{#if status === 'error'}
  {#if errorSnippet}
    {@render errorSnippet()}
  {:else}
    <ErrorState message={errorMessage} retry={!!onretry} {retryLabel} {onretry} />
  {/if}
{:else if status === 'pending'}
  {#if fallback}
    {@render fallback()}
  {:else}
    <SkeletonStack />
  {/if}
{:else}
  {@render children()}
{/if}
