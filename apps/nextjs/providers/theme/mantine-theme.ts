import { createTheme, type MantineColorsTuple } from '@mantine/core'

type Ramp =
  'primary' | 'secondary' | 'tertiary' | 'info' | 'success' | 'warning' | 'error' | 'surface'

function ramp(name: Ramp): MantineColorsTuple {
  const tone = (shade: number) => `var(--color-${name}-${shade})`
  return [
    tone(50),
    tone(100),
    tone(200),
    tone(300),
    tone(400),
    tone(500),
    tone(600),
    tone(700),
    tone(800),
    tone(900),
  ]
}

const colors = {
  primary: ramp('primary'),
  secondary: ramp('secondary'),
  tertiary: ramp('tertiary'),
  info: ramp('info'),
  success: ramp('success'),
  warning: ramp('warning'),
  error: ramp('error'),
  surface: ramp('surface'),
} satisfies Record<Ramp, MantineColorsTuple>

export const mantineTheme = createTheme({
  primaryColor: 'primary',
  primaryShade: { light: 6, dark: 4 },
  colors,
  defaultRadius: 'md',
})
