import { graphql } from '../generated/gql'

export const NlSearchSource = graphql(`
  mutation NlSearch($query: String!) {
    nlSearch(query: $query) {
      criteria {
        ...CriteriaFields
      }
      todos {
        ...TodoFields
      }
    }
  }
`)
