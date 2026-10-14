import { goto } from '$app/navigation'
import { resolve } from '$app/paths'
import { GraphQLRequestError, PRO_REQUIRED_CODE } from '@ia-task-manager/bff/graphql'
import { paths } from '$lib/constants/paths'
import { toaster } from '$lib/toast'

export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export const notifyError = (title: string) => (error: unknown) =>
  toaster.error({ title, description: toErrorMessage(error) })

export function notifySuccess(title: string, message: string): void {
  toaster.success({ title, description: message })
}

function isProRequired(error: unknown): boolean {
  return error instanceof GraphQLRequestError && error.code === PRO_REQUIRED_CODE
}

function notifyProRequired(): void {
  toaster.create({
    id: PRO_REQUIRED_CODE,
    type: 'info',
    title: 'Recurso do plano Pro',
    description: 'Este recurso usa IA e está disponível no plano Pro.',
    duration: Infinity,
    action: {
      label: 'Ver planos',
      onClick: () => void goto(resolve(paths.PLANOS)),
    },
  })
}

export function notifyAiError(title: string) {
  return (error: unknown): void => {
    if (isProRequired(error)) {
      notifyProRequired()
      return
    }
    notifyError(title)(error)
  }
}
