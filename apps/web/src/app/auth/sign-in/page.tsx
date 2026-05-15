import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { SignInForm } from './sign-in-form'

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 font-sans">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  )
}
