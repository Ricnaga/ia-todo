import { useToast } from '#imports'

export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export type Notifications = {
  notifyError: (title: string) => (error: unknown) => void
  notifySuccess: (title: string, message: string) => void
}

export function useNotifications(): Notifications {
  const toast = useToast()

  return {
    notifyError: (title) => (error) =>
      toast.add({ title, description: toErrorMessage(error), color: 'error' }),
    notifySuccess: (title, message) => toast.add({ title, description: message, color: 'success' }),
  }
}
