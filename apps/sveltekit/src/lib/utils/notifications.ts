import { toaster } from '$lib/toast'

export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export const notifyError = (title: string) => (error: unknown) =>
  toaster.error({ title, description: toErrorMessage(error) })

export function notifySuccess(title: string, message: string): void {
  toaster.success({ title, description: message })
}
