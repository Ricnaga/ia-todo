<script setup lang="ts">
import { useSeoMeta } from '#imports'

definePageMeta({ layout: 'private' })

useSeoMeta({ title: 'Tarefas | ia-task-manager' })
</script>

<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6">
    <ContentTodoManager />
  </div>
</template>
