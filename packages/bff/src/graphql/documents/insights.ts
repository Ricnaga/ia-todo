import { graphql } from '../generated/gql'

export const SummarizeDaySource = graphql(`
  mutation SummarizeDay {
    summarizeDay {
      ...DaySummaryFields
    }
  }
`)
