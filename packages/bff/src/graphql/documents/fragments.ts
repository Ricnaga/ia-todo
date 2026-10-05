import { graphql } from '../generated/gql'

/**
 * Contrato GraphQL de cada tipo do BFF, em um lugar so para os tres apps.
 *
 * Antes desta migracao cada app tinha uma copia byte-identica deste arquivo e
 * cada documento terminava com `${TODO_FIELDS}` para carregar a definicao. O
 * codegen monta a definicao do fragmento no proprio documento gerado, entao a
 * interpolacao manual saiu: o risco classico de `Unknown fragment` em runtime
 * -- usar o spread e esquecer de anexar a definicao -- deixa de ser possivel,
 * porque nao ha mais nada para esquecer.
 *
 * A ordem dos campos espelha `packages/bff/src/pothos/modules/<ctx>/<ctx>.ref.ts`.
 * Mudar o schema e mudar aqui -- e o `pnpm codegen` transforma qualquer campo
 * apagado em erro de build, porque o documento gerado deixa de compilar.
 *
 * Este arquivo e entrada do codegen, nao codigo de app: os apps importam os
 * documentos ja gerados de `../generated/graphql`, nunca daqui. E por isso que
 * ele nao entra no bundle do cliente.
 */

export const TodoFieldsSource = graphql(/* GraphQL */ `
  fragment TodoFields on Todo {
    id
    title
    description
    priority
    dueDate
    completed
    createdAt
    updatedAt
    subtasks {
      id
      title
      done
    }
  }
`)

export const TodoSuggestionFieldsSource = graphql(/* GraphQL */ `
  fragment TodoSuggestionFields on TodoSuggestion {
    title
    description
    priority
    subtasks
  }
`)

export const CriteriaFieldsSource = graphql(/* GraphQL */ `
  fragment CriteriaFields on Criteria {
    query
    keywords
    status
    priority
    due
  }
`)

export const DaySummaryFieldsSource = graphql(/* GraphQL */ `
  fragment DaySummaryFields on DaySummary {
    summary
    focus
    suggestedOrder
  }
`)

export const AuthUserFieldsSource = graphql(/* GraphQL */ `
  fragment AuthUserFields on AuthUser {
    id
    name
    email
    emailVerified
    image
    createdAt
    updatedAt
  }
`)

export const AuthAccountFieldsSource = graphql(/* GraphQL */ `
  fragment AuthAccountFields on AuthAccount {
    id
    providerId
    accountId
    userId
    createdAt
    updatedAt
  }
`)

export const AuthSessionFieldsSource = graphql(/* GraphQL */ `
  fragment AuthSessionFields on AuthSession {
    id
    isCurrent
    expiresAt
    ipAddress
    userAgent
    createdAt
    updatedAt
  }
`)
