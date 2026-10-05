/**
 * Superficie publica do contrato GraphQL, exposta como
 * `@ia-task-manager/bff/graphql`.
 *
 * O subpath existe por seguranca, nao por organizacao: a export `"."` deste
 * pacote aponta para `src/index.ts`, que monta o Yoga e puxa `@pothos/core`,
 * `graphql-yoga` e o `@ia-task-manager/server` (Prisma, better-auth). Um
 * componente cliente que importasse `@ia-task-manager/bff` sem o subpath
 * arrastaria o servidor inteiro para o bundle do navegador. Como este arquivo so
 * reexporta tipos e o envelope de erro, o subpath garante que o que o cliente
 * importa nao tem nenhum caminho de runtime para o servidor.
 *
 * Reexporta `./generated/graphql`, que tem os tipos de cada operacao e os
 * documentos ja tipados (`ListTodosDocument`, `MeDocument`, ...).
 *
 * Deliberadamente NAO reexporta `./generated/gql`. Esse arquivo traz a funcao
 * `graphql()` e a tabela que mapeia o texto do documento para o documento
 * gerado -- e o proprio cod do gerador avisa que ela nao e tree-shakeable e
 * carrega todas as operacoes do projeto para dentro do bundle. Os apps nao
 * precisam dela: importam o documento pronto. Ela existe apenas para o
 * `documents/` declarar os fontes que o codegen le, e nada mais importa dali.
 *
 * Os arquivos em `generated/` sao output do `pnpm codegen` e vem com
 * `eslint-disable` no topo. Nao editar a mao.
 */
export * from './generated/graphql'
export * from './error'

/**
 * O tipo do documento GraphQL, reexportado com um nome curto.
 *
 * Os tres apps assinam `request(document: Document<...>)`.reexportar aqui evita
 * que cada um declare `@graphql-typed-document-node/core` como dependencia
 * propria -- ela fica num lugar so, e o contrato continua no pacote que ja e
 * a fonte da verdade do contrato.
 */
export type { TypedDocumentNode as Document } from '@graphql-typed-document-node/core'
