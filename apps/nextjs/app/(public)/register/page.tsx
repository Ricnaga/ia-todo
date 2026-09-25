import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CardAuth } from '../_components/card-auth/card-auth'
import { FormRegister } from './_components/form-register/form-register'

export const metadata: Metadata = {
  title: 'Criar conta | ia-task-manager',
}

type RegisterPageProps = {
  searchParams: Promise<{ next?: string }>
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { next } = await searchParams

  return (
    <CardAuth title="ia-task-manager">
      <Suspense>
        <FormRegister callbackURL={next} />
      </Suspense>
    </CardAuth>
  )
}
