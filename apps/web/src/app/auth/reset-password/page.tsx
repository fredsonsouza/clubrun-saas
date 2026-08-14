'use client'

import { FormError } from '@/components/form-error'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useFormState } from '@/hooks/use-form-state'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Flame,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { resetPasswordAction } from './actions'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  const [{ success, message, errors }, handleSubmit, isPending] =
    useFormState(resetPasswordAction)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 p-6 font-sans">
      <div className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[800px] rounded-full bg-orange-500/5 blur-[120px]" />

      <div className="zoom-in-95 relative z-10 w-full max-w-md animate-in rounded-3xl border border-gray-100 bg-white p-8 shadow-xl duration-500 sm:p-10">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 shadow-md shadow-orange-500/20 transition-transform group-hover:scale-105">
              <Flame className="h-7 w-7 text-white" fill="currentColor" />
            </div>
          </Link>
        </div>

        {!success ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="mb-2 font-extrabold text-2xl text-gray-900 tracking-tight">
                Nova Senha
              </h1>
              <p className="font-medium text-gray-500 text-sm">
                Crie uma senha forte e segura para proteger sua conta.
              </p>
            </div>

            {success === false && message && (
              <Alert className="mb-6 border-orange-500/10 bg-orange-500/5">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <AlertTitle className="font-bold text-orange-500 uppercase">
                  Erro ao redefinir
                </AlertTitle>
                <AlertDescription className="text-orange-900/70">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {!code ? (
              <Alert className="mb-6 border-amber-500/10 bg-amber-500/5">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle className="font-bold text-amber-500 uppercase">
                  Código Inválido
                </AlertTitle>
                <AlertDescription className="text-amber-900/70">
                  O link de recuperação parece estar incompleto ou expirado.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <input type="hidden" name="code" value={code} />

                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="font-bold text-gray-700 text-sm"
                  >
                    Nova Senha
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Mínimo 8 caracteres"
                    className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 font-medium text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 ${
                      errors?.password
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/50'
                    }`}
                  />
                  <FormError message={errors?.password?.[0]} />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="password_confirmation"
                    className="font-bold text-gray-700 text-sm"
                  >
                    Confirmar Nova Senha
                  </label>
                  <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    required
                    placeholder="Repita a nova senha"
                    className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 font-medium text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 ${
                      errors?.password_confirmation
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/50'
                    }`}
                  />
                  <FormError message={errors?.password_confirmation?.[0]} />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 font-bold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
                >
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Redefinir Senha'
                  )}
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="fade-in slide-in-from-bottom-4 animate-in text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="mb-3 font-extrabold text-2xl text-gray-900 tracking-tight">
              Tudo Pronto!
            </h2>
            <p className="mb-8 font-medium text-gray-500 text-sm">
              Sua senha foi alterada com sucesso. Agora você já pode acessar sua
              conta novamente.
            </p>
            <Link
              href="/auth/sign-in"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3.5 font-bold text-white shadow-sm transition-all hover:bg-gray-800 active:scale-95"
            >
              Fazer Login <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 font-sans">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
