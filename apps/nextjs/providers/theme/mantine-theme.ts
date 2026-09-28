import { createTheme, type MantineColorsTuple } from '@mantine/core'
import { Notifications } from '@mantine/notifications'

/**
 * Mantine expoe 10 tons por cor; a rampa compartilhada tem 11 (50 -> 950).
 * `ramp()` e o unico lugar do app que conhece a numeracao dos dois lados.
 */
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

/**
 * `--ds-accent` aponta para primary-600 no light e primary-400 no dark.
 * `primaryShade` reproduz essa escolha para que `theme.primaryColor` com shade
 * automatico concorda com a camada semantica nos dois modos.
 */
export const mantineTheme = createTheme({
  primaryColor: 'primary',
  primaryShade: { light: 6, dark: 4 },
  colors,
  defaultRadius: 'md',
  components: {
    /**
     * A politica de notificacao fica no tema, e nao em props no JSX: o
     * `AppNotifications` renderiza <Notifications /> sem argumentar nada, e
     * qualquer tela nova que monte um container proprio herda o mesmo
     * comportamento. O Mantine so aplica os defaults aqui se o componente for
     * oextended (extend) -- por isso o Notifications, e nao uma prop solta.
     */
    Notifications: Notifications.extend({
      defaultProps: {
        position: 'top-right',
        autoClose: 4_000,
        limit: 5,
      },
    }),
  },
})
