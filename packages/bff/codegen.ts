import type { CodegenConfig } from '@graphql-codegen/cli'

/**
 * Config do codegen GraphQL.
 *
 * O schema vem de `schema.graphql`, gerado do Pothos por
 * `scripts/build-schema.ts`. O `pnpm codegen` roda esse script antes deste,
 * entao o SDL nunca esta velho no momento em que e lido. A geracao vive num
 * passo separado porque o codegen carrega o config com o jiti, que nao consegue
 * importar o schema Pothos -- o motivo esta em `build-schema.ts`.
 *
 * Os documentos vivem em `src/graphql/documents/` e nao nos apps. Sao o unico
 * lugar onde o texto GraphQL aparece, e o codegen produz o tipo exato de cada
 * operacao a partir deles.
 *
 * O segundo glob e a valvula de escape: se um dia um app precisar de uma query
 * que so ele usa, ela nasce em `apps/<app>/services/**\/*.documents.ts` e passa
 * pelo mesmo gerador -- tipada e validada igual. O compartilhado e o padrao,
 * nao uma prisao.
 *
 * Este gerador tambem substituiu o `validate-graphql-documents.ts`, que rodava
 * no `gate`. A cobertura foi conferida caso a caso, com documentos invalidos de
 * verdade, e nao por leitura:
 *
 *   caso                              | validador antigo | codegen
 *   ----------------------------------|------------------|---------------------------
 *   campo inexistente                 | pega             | pega (exit 1)
 *   fragment desconhecido             | pega             | pega (exit 1)
 *   sintaxe malformada                | pega             | pega (exit 1)
 *   tipo de variavel inexistente      | pega             | pega (exit 1)
 *   tipo errado no argumento          | pega             | pega (exit 1)
 *   interpolacao sem fragmento        | pega             | sem objeto (ver abaixo)
 *   os 3 `fragments.ts` iguais         | pegava por diff  | sem objeto (ver abaixo)
 *   os 3 apps com os mesmos 17 docs   | pegava por diff  | sem objeto (ver abaixo)
 *   fragmento definido e nunca usado  | pega             | NAO pega (exit 0)
 *
 * As tres linhas "sem objeto" sao invariantes que a arquitetura nova torna
 * impossíveis, nao casos que o codegen deixou passar: nao existe mais
 * interpolacao manual para esquecer de resolver, existe uma unica copia dos
 * fragmentos, e os tres apps importam o mesmo documento em vez de reescreve-lo.
 *
 * A unica diferenca real e a ultima: um fragmento definido e nunca espalhado
 * passa. O codegen valida cada documento isolado e so costura os fragmentos na
 * etapa seguinte, entao nao enxerga o fragmento orfao. Isso e codigo morto e um
 * `generated/` com um tipo sem consumidor -- nao um bug de runtime, e nao a
 * metade que importava do `Fragment never used` do validador antigo, que era
 * proteger contra esquecer de interpolar a definicao no documento. Ficar de olho
 * num fragmento orfao e trabalho de revisao de 7 linhas em `fragments.ts`, nao
 * justificou ressuscitar um validador.
 */
const config: CodegenConfig = {
  schema: './schema.graphql',
  documents: ['src/graphql/documents/**/*.ts', '../../apps/*/services/**/*.documents.ts'],
  // Sem isto o codegen sai com codigo 0 quando um glob nao casa nada, que e
  // exatamente o modo de falha silencioso que o validador caseiro tinha.
  ignoreNoDocuments: false,
  // Um documento invalido nunca pode gerar arquivo parcial: se um campo foi
  // renomeado no Pothos, o `generated/` precisa continuar com a versao anterior
  // (que o typecheck ainda rejeita) em vez de virar meia tipagem que passa.
  allowPartialOutputs: false,
  generates: {
    './src/graphql/generated/': {
      preset: 'client',
      presetConfig: {
        // Nao usamos fragment masking: os tipos de fragmento sao inlinados na
        // operacao, entao nao existe props de componente para mascarar e o
        // `fragment-masking.ts` nao teria quem consumir.
        fragmentMasking: false,
      },
      config: {
        // Documento vira `DocumentNode` com o tipo do resultado embutido. E o que
        // deixa `request(ListTodosDocument)` inferir TResult e TVariables, sem
        // type argument na chamada. No modo `string` o documento seria uma
        // string sem tipo e cada chamada precisaria de `request<T>(...)`.
        documentMode: 'documentNode',
        // O preset injeta `__typename` em cada selection set por padrao. Aqui
        // nao: nenhum componente do projeto usa fragment masking, entao seria
        // trafego extra no wire e no tipo sem nenhum consumidor.
        skipTypename: true,
        // `DateTime` e o unico scalar custom do schema. Sem o mapeamento ele
        // cai em `any`; com `strictScalars` qualquer scalar novo que aparecer
        // vira erro de build em vez de `any` silencioso.
        scalars: { DateTime: 'string' },
        strictScalars: true,
        // Gera `'low' | 'medium' | 'high' | 'urgent'` em vez de um `enum` do
        // TypeScript. E o mesmo tipo que o Zod ja infere em `todoSchema`, entao
        // o valor gerado e atribuivel ao tipo do dominio sem conversao.
        enumsAsTypes: true,
        useTypeImports: true,
      },
    },
  },
}

export default config
