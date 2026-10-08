<script setup lang="ts">
import { reactive } from 'vue'
import { changePasswordSchema } from '@ia-task-manager/schemas/auth'
import type { ChangePasswordInput } from '@ia-task-manager/schemas/auth'
import { useNotifications } from '~/lib/utils/notifications'
import { useChangePasswordMutation } from '~/services/auth/auth.mutation'

const { notifyError, notifySuccess } = useNotifications()
const changePasswordMutation = useChangePasswordMutation()

const state = reactive<ChangePasswordInput>({ currentPassword: '', newPassword: '' })

function onSubmit() {
  changePasswordMutation.mutate(
    { currentPassword: state.currentPassword, newPassword: state.newPassword },
    {
      onError: notifyError('Não foi possível alterar a senha'),
      onSuccess: () => {
        notifySuccess('Senha alterada', 'Sua senha foi atualizada com sucesso.')
        state.currentPassword = ''
        state.newPassword = ''
      },
    },
  )
}
</script>

<template>
  <UCard class="animate-in fade-in duration-base ease-entrance max-w-md">
    <div class="flex flex-col gap-4">
      <h2 class="text-highlighted font-semibold">Alterar senha</h2>

      <UForm :schema="changePasswordSchema" :state="state" :transform="false" @submit="onSubmit">
        <div class="flex flex-col gap-4">
          <UFormField label="Senha atual" name="currentPassword" required>
            <UInput
              v-model="state.currentPassword"
              class="w-full"
              type="password"
              placeholder="Sua senha atual"
            />
          </UFormField>

          <UFormField label="Nova senha" name="newPassword" required>
            <UInput
              v-model="state.newPassword"
              class="w-full"
              type="password"
              placeholder="Mínimo de 8 caracteres"
            />
          </UFormField>

          <UButton
            type="submit"
            class="self-start"
            :loading="changePasswordMutation.isPending.value"
          >
            Alterar senha
          </UButton>
        </div>
      </UForm>
    </div>
  </UCard>
</template>
