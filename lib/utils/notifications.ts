import { notifications } from '@mantine/notifications'

export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export const notifyError = (title: string) => (error: unknown) =>
  notifications.show({ title, message: toErrorMessage(error), color: 'red' })

export function notifySuccess(title: string, message: string): void {
  notifications.show({ title, message, color: 'green' })
}
