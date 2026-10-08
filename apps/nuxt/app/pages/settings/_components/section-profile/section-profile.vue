<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { z } from 'zod'
import { paths } from '~/lib/constants/paths'
import { useNotifications } from '~/lib/utils/notifications'
import { useChangeEmailMutation, useUpdateProfileMutation } from '~/services/auth/auth.mutation'
import { useMeQuery } from '~/services/auth/auth.query'

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome'),
  image: z.string().refine((value) => value === '' || /^https?:\/\//.test(value), 'URL inválida'),
})

const emailSchema = z.object({
  newEmail: z.email('E-mail inválido'),
})

type ProfileValues = z.infer<typeof profileSchema>

const { notifyError, notifySuccess } = useNotifications()
const { data: user, status, error, execute } = useMeQuery()

const updateProfileMutation = useUpdateProfileMutation()
const changeEmailMutation = useChangeEmailMutation()

const isPending = computed(() => status.value === 'pending')

const profileState = reactive<ProfileValues>({ name: '', image: '' })
const emailState = reactive({ newEmail: '' })
const hydrated = ref(false)

watch(
  user,
  (value) => {
    if (!value || hydrated.value) return
    profileState.name = value.name
    profileState.image = value.image ?? ''
    hydrated.value = true
  },
  { immediate: true },
)

function onSubmitProfile() {
  updateProfileMutation.mutate(
    { name: profileState.name.trim(), image: profileState.image || null },
    {
      onError: notifyError('Não foi possível atualizar o perfil'),
      onSuccess: () => notifySuccess('Perfil atualizado', 'Suas informações foram salvas.'),
    },
  )
}

function onSubmitEmail() {
  changeEmailMutation.mutate(
    { newEmail: emailState.newEmail, callbackURL: paths.SETTINGS },
    {
      onError: notifyError('Não foi possível alterar o e-mail'),
      onSuccess: () => {
        notifySuccess(
          'E-mail enviado',
          'Confira sua caixa de entrada para confirmar o novo e-mail.',
        )
        emailState.newEmail = ''
      },
    },
  )
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <ErrorState v-if="error" retry @retry="execute()" />

    <SkeletonStack v-else-if="isPending || !user" :lines="4" :row-height="44" />

    <template v-else>
      <UCard class="animate-in fade-in duration-base ease-entrance">
        <div class="flex flex-col gap-4">
          <h2 class="text-highlighted font-semibold">Informações básicas</h2>

          <UForm
            :schema="profileSchema"
            :state="profileState"
            :transform="false"
            @submit="onSubmitProfile"
          >
            <div class="flex flex-col gap-4">
              <UFormField label="Nome" name="name" required>
                <UInput v-model="profileState.name" class="w-full" placeholder="Seu nome" />
              </UFormField>

              <UFormField
                label="Foto (URL)"
                name="image"
                description="URL pública de uma imagem de perfil"
              >
                <UInput v-model="profileState.image" class="w-full" placeholder="https://..." />
              </UFormField>

              <UButton
                type="submit"
                class="self-start"
                :loading="updateProfileMutation.isPending.value"
              >
                Salvar perfil
              </UButton>
            </div>
          </UForm>
        </div>
      </UCard>

      <UCard class="animate-in fade-in duration-base ease-entrance">
        <div class="flex flex-col gap-4">
          <h2 class="text-highlighted font-semibold">E-mail</h2>

          <div class="flex flex-wrap items-center gap-2">
            <span>{{ user.email }}</span>
            <UBadge
              size="sm"
              :color="user.emailVerified ? 'success' : 'warning'"
              :variant="user.emailVerified ? 'soft' : 'outline'"
            >
              {{ user.emailVerified ? 'Verificado' : 'Não verificado' }}
            </UBadge>
          </div>

          <USeparator />

          <UForm
            :schema="emailSchema"
            :state="emailState"
            :transform="false"
            @submit="onSubmitEmail"
          >
            <div class="flex flex-col gap-4">
              <UFormField
                label="Novo e-mail"
                name="newEmail"
                description="Você receberá um link de verificação no novo endereço."
              >
                <UInput
                  v-model="emailState.newEmail"
                  class="w-full"
                  icon="i-tabler:mail"
                  placeholder="novo@exemplo.com"
                />
              </UFormField>

              <UButton
                type="submit"
                variant="soft"
                class="self-start"
                :loading="changeEmailMutation.isPending.value"
              >
                Alterar e-mail
              </UButton>
            </div>
          </UForm>
        </div>
      </UCard>
    </template>
  </div>
</template>
