import { graphql } from '../generated/gql'

/**
 * Operacoes de `assistant`.
 *
 * `nlSearch` e uma mutation e recebe apenas `query: string` -- o resto da
 * busca (filtros, prazo) e decidido pelo modelo, nao pelo cliente.
 */

export const NlSearchSource = graphql(/* GraphQL */ `
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
