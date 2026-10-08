<script setup lang="ts">
import { useSeoMeta } from '#imports'
import FormNlSearch from './busca/_components/form-nl-search.vue'

definePageMeta({ layout: 'private' })

useSeoMeta({ title: 'Busca por IA | ia-task-manager' })
</script>

<template>
  <div class="mx-auto w-full px-4 py-6">
    <FormNlSearch />
  </div>
</template>
