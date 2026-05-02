'use client'

import { useFormState } from '@/hooks/use-form-state'
import { resetPasswordAction } from './actions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Loader2, Flame, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  const [{ success, message, errors }, handleSubmit, isPending] = useFormState(
    resetPasswordAction
  )

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 p-6 font-sans">
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/5 blur-[120px]" />

      <div className="animate-in zoom-in-95 relative z-10 w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-xl duration-500 sm:p-10">
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
              <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-gray-900">
                Nova Senha
              </h1>
              <p className="text-sm font-medium text-gray-500">
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <input type="hidden" name="code" value={code} />

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-bold text-gray-700">
                    Nova Senha
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Mínimo 8 caracteres"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 font-medium text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                  {errors?.password && (
                    <p className="text-xs font-bold text-orange-600">
                      {errors.password[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password_confirmation" className="text-sm font-bold text-gray-700">
                    Confirmar Nova Senha
                  </label>
                  <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    required
                    placeholder="Repita a nova senha"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 font-medium text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
                  />
                  {errors?.password_confirmation && (
                    <p className="text-xs font-bold text-orange-600">
                      {errors.password_confirmation[0]}
                    </p>
                  )}
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
          <div className="animate-in fade-in slide-in-from-bottom-4 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-gray-900">
              Tudo Pronto!
            </h2>
            <p className="mb-8 text-sm font-medium text-gray-500">
              Sua senha foi alterada com sucesso. Agora você já pode acessar sua conta novamente.
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
