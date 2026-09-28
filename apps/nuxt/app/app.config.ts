/**
 * Mapeia os nomes de cor do Nuxt UI para as ramps compartilhadas.
 *
 * Sem isso o Nuxt UI geraria `--ui-color-<nome>-<shade>` a partir da paleta
 * propria dele. O `adapters/nuxt-ui.css` ja faz esses `--ui-*` apontarem para
 * `var(--color-<ramp>-<shade>)`; aqui So falta dizer qual ramp corresponde a
 * cada nome logico.
 *
 * `neutral` -> `surface` porque o Nuxt UI chama de "neutral" a rampa de fundo e
 * borda, que e exatamente o papel de `surface` no token compartilhado.
 */
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'primary',
      secondary: 'secondary',
      tertiary: 'tertiary',
      success: 'success',
      info: 'info',
      warning: 'warning',
      error: 'error',
      neutral: 'surface',
    },
  },
})
