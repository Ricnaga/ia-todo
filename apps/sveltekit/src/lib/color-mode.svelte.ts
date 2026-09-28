import { browser } from '$app/environment'

export type ColorMode = 'light' | 'dark'

const STORAGE_KEY = 'color-mode'
const ATTRIBUTE = 'data-mode'

/**
 * O <html> recebe `data-mode` antes da pintura por um script inline em
 * app.html. Ler o atributo — em vez de recalcular a preferencia aqui — mantem o
 * servidor e o cliente na mesma fonte de verdade e evita hydration mismatch.
 */
function fromDocument(): ColorMode {
  const value = document.documentElement.getAttribute(ATTRIBUTE)
  return value === 'dark' ? 'dark' : 'light'
}

let current = $state<ColorMode>(browser ? fromDocument() : 'light')

function set(next: ColorMode): void {
  current = next
  document.documentElement.setAttribute(ATTRIBUTE, next)
  localStorage.setItem(STORAGE_KEY, next)
}

export const colorMode = {
  get current(): ColorMode {
    return current
  },

  toggle(): void {
    set(current === 'dark' ? 'light' : 'dark')
  },
}
