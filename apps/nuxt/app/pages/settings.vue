<script setup lang="ts">
import { useSeoMeta } from '#imports'

definePageMeta({ layout: 'private' })

useSeoMeta({ title: 'Configurações | ia-task-manager' })
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-4 py-6">
    <SettingsPanel />
  </div>
</template>
