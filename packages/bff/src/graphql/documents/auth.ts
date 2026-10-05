import { graphql } from '../generated/gql'

/**
 * Operacoes de `auth`.
 *
 * As seis mutations que devolvem so `Boolean` nao usam fragment: o valor
 * primitivo ja e o contrato. As tres queries usam fragment porque devolvem
 * entidades.
 */

export const MeSource = graphql(/* GraphQL */ `
  query Me {
    me {
      ...AuthUserFields
    }
  }
`)

export const MyAccountsSource = graphql(/* GraphQL */ `
  query MyAccounts {
    myAccounts {
      ...AuthAccountFields
    }
  }
`)

export const MySessionsSource = graphql(/* GraphQL */ `
  query MySessions {
    mySessions {
      ...AuthSessionFields
    }
  }
`)

export const UpdateProfileSource = graphql(/* GraphQL */ `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...AuthUserFields
    }
  }
`)

export const ChangeEmailSource = graphql(/* GraphQL */ `
  mutation ChangeEmail($input: ChangeEmailInput!) {
    changeEmail(input: $input)
  }
`)

export const ChangePasswordSource = graphql(/* GraphQL */ `
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`)

export const UnlinkAccountSource = graphql(/* GraphQL */ `
  mutation UnlinkAccount($input: UnlinkAccountInput!) {
    unlinkAccount(input: $input)
  }
`)

export const RevokeSessionSource = graphql(/* GraphQL */ `
  mutation RevokeSession($input: RevokeSessionInput!) {
    revokeSession(input: $input)
  }
`)

export const RevokeOtherSessionsSource = graphql(/* GraphQL */ `
  mutation RevokeOtherSessions {
    revokeOtherSessions
  }
`)
