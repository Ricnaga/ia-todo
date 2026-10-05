import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './schema.graphql',
  documents: ['src/graphql/documents/**/*.ts', '../../apps/*/services/**/*.documents.ts'],

  ignoreNoDocuments: false,

  allowPartialOutputs: false,
  generates: {
    './src/graphql/generated/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        documentMode: 'documentNode',

        skipTypename: true,

        scalars: { DateTime: 'string' },
        strictScalars: true,

        enumsAsTypes: true,
        useTypeImports: true,
      },
    },
  },
}

export default config
