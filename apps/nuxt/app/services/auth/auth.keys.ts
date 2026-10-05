export const authQueryKeys = {
  me: 'AUTH_ME',
  accounts: 'AUTH_ACCOUNTS',
  sessions: 'AUTH_SESSIONS',
  writeTargets: () =>
    [authQueryKeys.me, authQueryKeys.accounts, authQueryKeys.sessions] as string[],
} as const
