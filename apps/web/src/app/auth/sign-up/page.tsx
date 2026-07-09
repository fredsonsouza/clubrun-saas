import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import { SignUpForm } from './sign-up-form'

export default function SignUpPage() {
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
