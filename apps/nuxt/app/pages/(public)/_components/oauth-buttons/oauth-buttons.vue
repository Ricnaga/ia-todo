<script setup lang="ts">
type SocialProvider = 'google' | 'github'

defineProps<{ loading?: boolean }>()

const emit = defineEmits<{ social: [provider: SocialProvider] }>()
</script>

<template>
  <div class="flex gap-2">
    <UButton
      block
      variant="soft"
      icon="i-tabler:brand-google"
      :loading="loading"
      @click="emit('social', 'google')"
    >
      Google
    </UButton>
    <UButton
      block
      variant="soft"
      icon="i-tabler:brand-github"
      :loading="loading"
      @click="emit('social', 'github')"
    >
      GitHub
    </UButton>
  </div>
</template>
