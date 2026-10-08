<script setup lang="ts">
import { navigateTo } from '#imports'
import { reactive, ref } from 'vue'
import { z } from 'zod'
import { paths } from '~/lib/constants/paths'
import { useNotifications } from '~/lib/utils/notifications'
import { authClient } from '~/services/auth/auth.client'
import OAuthButtons from '../../../_components/oauth-buttons/oauth-buttons.vue'

const props = defineProps<{ callbackURL?: string }>()

const { notifyError, notifySuccess } = useNotifications()

const loginSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(1, 'Informe sua senha'),
})

type LoginValues = z.infer<typeof loginSchema>

const state = reactive<LoginValues>({ email: '', password: '' })
const isSubmitting = ref(false)
const isSocialSubmitting = ref(false)

const callbackURL = props.callbackURL ?? paths.DASHBOARD

async function onSubmit(): Promise<void> {
  isSubmitting.value = true
  try {
    const response = await authClient.signIn.email({
      email: state.email,
      password: state.password,
      callbackURL,
    })
    if (response.error) {
      notifyError('Falha ao entrar')(response.error)
      return
    }
    notifySuccess('Login realizado', 'Bem-vindo(a) de volta!')
    await navigateTo(callbackURL)
  } catch (error) {
    notifyError('Ops, algo deu errado')(error)
  } finally {
    isSubmitting.value = false
  }
}

async function onSocial(provider: 'google' | 'github'): Promise<void> {
  isSocialSubmitting.value = true
  try {
    const response = await authClient.signIn.social({ provider, callbackURL })
    if (response.error) notifyError('Falha na autenticação social')(response.error)
  } catch (error) {
    notifyError('Ops, algo deu errado')(error)
  } finally {
    isSocialSubmitting.value = false
  }
}
</script>

<template>
  <UForm :schema="loginSchema" :state="state" @submit="onSubmit">
    <div class="flex flex-col gap-4">
      <UFormField label="E-mail" name="email" required>
        <UInput v-model="state.email" class="w-full" placeholder="voce@exemplo.com" />
      </UFormField>

      <UFormField label="Senha" name="password" required>
        <UInput v-model="state.password" class="w-full" type="password" placeholder="Sua senha" />
      </UFormField>

      <UButton type="submit" :loading="isSubmitting" block> Entrar </UButton>

      <USeparator label="ou continue com" />

      <OAuthButtons :loading="isSocialSubmitting" @social="onSocial" />

      <p class="text-dimmed text-center text-sm">
        Ainda não tem conta?
        <NuxtLink :to="paths.REGISTER" class="text-primary font-medium hover:underline">
          Crie uma agora
        </NuxtLink>
      </p>
    </div>
  </UForm>
</template>
