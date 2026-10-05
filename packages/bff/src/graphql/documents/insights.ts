import { graphql } from '../generated/gql'

/**
 * Operacoes de `insights`.
 *
 * `summarizeDay` e mutation, e nao query: resumir o dia chama o modelo.
 */

export const SummarizeDaySource = graphql(/* GraphQL */ `
  mutation SummarizeDay {
    summarizeDay {
      ...DaySummaryFields
    }
  }
`)
