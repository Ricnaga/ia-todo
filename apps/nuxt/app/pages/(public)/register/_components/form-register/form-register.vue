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

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome'),
  email: z.email('E-mail inválido'),
  password: z
    .string()
    .min(8, 'A senha deve ter ao menos 8 caracteres')
    .max(128, 'A senha deve ter no máximo 128 caracteres'),
})

type RegisterValues = z.infer<typeof registerSchema>

const state = reactive<RegisterValues>({ name: '', email: '', password: '' })
const isSubmitting = ref(false)
const isSocialSubmitting = ref(false)

const callbackURL = props.callbackURL ?? paths.DASHBOARD

async function onSubmit(): Promise<void> {
  isSubmitting.value = true
  try {
    const response = await authClient.signUp.email({
      name: state.name.trim(),
      email: state.email,
      password: state.password,
      callbackURL,
    })
    if (response.error) {
      notifyError('Não foi possível criar a conta')(response.error)
      return
    }
    notifySuccess('Conta criada', 'Bem-vindo(a)!')
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
  <UForm :schema="registerSchema" :state="state" @submit="onSubmit">
    <div class="flex flex-col gap-4">
      <UFormField label="Nome" name="name" required>
        <UInput v-model="state.name" class="w-full" placeholder="Como podemos te chamar?" />
      </UFormField>

      <UFormField label="E-mail" name="email" required>
        <UInput v-model="state.email" class="w-full" placeholder="voce@exemplo.com" />
      </UFormField>

      <UFormField label="Senha" name="password" required>
        <UInput
          v-model="state.password"
          class="w-full"
          type="password"
          placeholder="Mínimo de 8 caracteres"
        />
      </UFormField>

      <UButton type="submit" :loading="isSubmitting" block> Criar conta </UButton>

      <USeparator label="ou crie conta com" />

      <OAuthButtons :loading="isSocialSubmitting" @social="onSocial" />

      <p class="text-dimmed text-center text-sm">
        Já tem uma conta?
        <NuxtLink :to="paths.LOGIN" class="text-primary font-medium hover:underline">
          Entrar
        </NuxtLink>
      </p>
    </div>
  </UForm>
</template>
