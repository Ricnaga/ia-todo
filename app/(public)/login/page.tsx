import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CardAuth } from '../_components/card-auth/card-auth'
import { FormLogin } from './_components/form-login/form-login'

export const metadata: Metadata = {
  title: 'Entrar | ia-task-manager',
}

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams

  return (
    <CardAuth title="ia-task-manager">
      <Suspense>
        <FormLogin callbackURL={next} />
      </Suspense>
    </CardAuth>
  )
}
