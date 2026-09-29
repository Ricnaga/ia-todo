import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import prettier from 'eslint-config-prettier'

export default createConfigForNuxt(
  {
    features: {
      tooling: true,
    },
  },
  prettier,
)
