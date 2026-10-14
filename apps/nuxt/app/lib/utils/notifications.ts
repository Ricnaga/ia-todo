import { navigateTo, useToast } from '#imports'
import { GraphQLRequestError, PRO_REQUIRED_CODE } from '@ia-task-manager/bff/graphql'
import { paths } from '~/lib/constants/paths'

export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export type Notifications = {
  notifyError: (title: string) => (error: unknown) => void
  notifySuccess: (title: string, message: string) => void
  notifyAiError: (title: string) => (error: unknown) => void
}

function isProRequired(error: unknown): boolean {
  return error instanceof GraphQLRequestError && error.code === PRO_REQUIRED_CODE
}

export function useNotifications(): Notifications {
  const toast = useToast()

  const notifyError = (title: string) => (error: unknown) =>
    toast.add({ title, description: toErrorMessage(error), color: 'error' })

  const notifySuccess = (title: string, message: string) =>
    toast.add({ title, description: message, color: 'success' })

  const notifyAiError = (title: string) => (error: unknown) => {
    if (isProRequired(error)) {
      toast.add({
        id: PRO_REQUIRED_CODE,
        title: 'Recurso do plano Pro',
        description: 'Este recurso usa IA e está disponível no plano Pro.',
        color: 'primary',
        duration: 0,
        actions: [
          {
            label: 'Ver planos',
            color: 'primary',
            variant: 'soft',
            onClick: () => {
              void navigateTo(paths.PLANOS)
            },
          },
        ],
      })
      return
    }
    notifyError(title)(error)
  }

  return { notifyError, notifySuccess, notifyAiError }
}
