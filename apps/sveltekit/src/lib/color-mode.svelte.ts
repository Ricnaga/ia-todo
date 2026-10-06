import { browser } from '$app/environment'

export type ColorMode = 'light' | 'dark'
export type ColorModePreference = ColorMode | 'auto'

const STORAGE_KEY = 'color-mode'
const ATTRIBUTE = 'data-mode'

function isPreference(value: string | null): value is ColorModePreference {
  return value === 'light' || value === 'dark' || value === 'auto'
}

function readStored(): ColorModePreference {
  const stored = localStorage.getItem(STORAGE_KEY)
  return isPreference(stored) ? stored : 'auto'
}

function systemMode(): ColorMode {
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolve(preference: ColorModePreference): ColorMode {
  return preference === 'auto' ? systemMode() : preference
}

function fromDocument(): ColorMode {
  return document.documentElement.getAttribute(ATTRIBUTE) === 'dark' ? 'dark' : 'light'
}

let preference = $state<ColorModePreference>(browser ? readStored() : 'auto')
let current = $state<ColorMode>(browser ? fromDocument() : 'light')

function apply(): void {
  const resolved = resolve(preference)
  current = resolved
  document.documentElement.setAttribute(ATTRIBUTE, resolved)
  localStorage.setItem(STORAGE_KEY, preference)
}

if (browser) {
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (preference === 'auto') apply()
  })
}

export const colorMode = {
  get current(): ColorMode {
    return current
  },

  get preference(): ColorModePreference {
    return preference
  },

  setPreference(next: ColorModePreference): void {
    preference = next
    apply()
  },
}
