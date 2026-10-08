<script setup lang="ts">
import { useRoute, useSeoMeta } from '#imports'
import { paths } from '~/lib/constants/paths'
import CardAuth from './_components/card-auth/card-auth.vue'
import FormLogin from './login/_components/form-login/form-login.vue'

useSeoMeta({ title: 'Entrar | ia-task-manager' })

const route = useRoute()

const callbackURL =
  typeof route.query.next === 'string' && route.query.next ? route.query.next : paths.DASHBOARD
</script>

<template>
  <CardAuth title="ia-task-manager">
    <FormLogin :callback-url="callbackURL" />
  </CardAuth>
</template>
