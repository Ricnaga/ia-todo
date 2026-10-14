<script setup lang="ts">
import { useSeoMeta } from '#imports'
import PlanManager from './planos/_components/plan-manager/plan-manager.vue'

definePageMeta({ layout: 'private' })

useSeoMeta({ title: 'Planos | ia-task-manager' })
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
    <PlanManager />
  </div>
</template>
