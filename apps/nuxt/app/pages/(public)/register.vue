<script setup lang="ts">
import { useRoute, useSeoMeta } from '#imports'
import { paths } from '~/lib/constants/paths'
import CardAuth from './_components/card-auth/card-auth.vue'
import FormRegister from './register/_components/form-register/form-register.vue'

useSeoMeta({ title: 'Criar conta | ia-task-manager' })

const route = useRoute()

const callbackURL =
  typeof route.query.next === 'string' && route.query.next ? route.query.next : paths.DASHBOARD
</script>

<template>
  <CardAuth title="ia-task-manager">
    <FormRegister :callback-url="callbackURL" />
  </CardAuth>
</template>
