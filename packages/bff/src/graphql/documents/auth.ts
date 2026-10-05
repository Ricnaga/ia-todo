import { graphql } from '../generated/gql'

export const MeSource = graphql(`
  query Me {
    me {
      ...AuthUserFields
    }
  }
`)

export const MyAccountsSource = graphql(`
  query MyAccounts {
    myAccounts {
      ...AuthAccountFields
    }
  }
`)

export const MySessionsSource = graphql(`
  query MySessions {
    mySessions {
      ...AuthSessionFields
    }
  }
`)

export const UpdateProfileSource = graphql(`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...AuthUserFields
    }
  }
`)

export const ChangeEmailSource = graphql(`
  mutation ChangeEmail($input: ChangeEmailInput!) {
    changeEmail(input: $input)
  }
`)

export const ChangePasswordSource = graphql(`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`)

export const UnlinkAccountSource = graphql(`
  mutation UnlinkAccount($input: UnlinkAccountInput!) {
    unlinkAccount(input: $input)
  }
`)

export const RevokeSessionSource = graphql(`
  mutation RevokeSession($input: RevokeSessionInput!) {
    revokeSession(input: $input)
  }
`)

export const RevokeOtherSessionsSource = graphql(`
  mutation RevokeOtherSessions {
    revokeOtherSessions
  }
`)
