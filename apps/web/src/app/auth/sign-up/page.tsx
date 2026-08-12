import { Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { SignUpForm } from './sign-up-form'

interface SignUpPageProps {
  searchParams: Promise<{
    token?: string
    inviteId?: string
    plan?: string
    role?: string
    redirectTo?: string
    email?: string
  }>
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { token, inviteId, plan, role, redirectTo, email } = await searchParams

  if (token || inviteId) {
    const destinationParams = new URLSearchParams()
    if (plan) destinationParams.set('plan', plan)
    if (role) destinationParams.set('role', role)
    if (redirectTo) destinationParams.set('redirectTo', redirectTo)
    if (email) destinationParams.set('email', email)

    const continueTo = `/auth/sign-up${destinationParams.size ? `?${destinationParams.toString()}` : ''}`
    const captureParams = new URLSearchParams({ continueTo })
    if (token) captureParams.set('token', token)
    if (inviteId) captureParams.set('inviteId', inviteId)

    redirect(`/api/auth/invite-continuation?${captureParams.toString()}`)
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 font-sans">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  )
}
