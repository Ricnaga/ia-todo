<script lang="ts">
  import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-svelte'

  type SocialProvider = 'google' | 'github'

  let {
    loading = false,
    onsocial,
  }: { loading?: boolean; onsocial?: (provider: SocialProvider) => void } = $props()
</script>

<div class="flex gap-2">
  <button
    type="button"
    class="btn preset-tonal flex-1"
    disabled={loading}
    onclick={() => onsocial?.('google')}
  >
    <IconBrandGoogle size={16} />
    Google
  </button>
  <button
    type="button"
    class="btn preset-tonal flex-1"
    disabled={loading}
    onclick={() => onsocial?.('github')}
  >
    <IconBrandGithub size={16} />
    GitHub
  </button>
</div>
