'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useFormState } from '@/hooks/use-form-state'
import { FormError } from '@/components/form-error'
import {
  AlertTriangle,
  ArrowLeft,
  Flame,
  Loader2,
  MailCheck,
} from 'lucide-react'
import Link from 'next/link'
import { forgotPasswordAction } from './actions'

export default function ForgotPasswordPage() {
  const [{ success, message, errors }, handleSubmit, isPending] =
    useFormState(forgotPasswordAction)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 p-6 font-sans">
      {/* Efeito Visual Laranja Suave no Fundo */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/5 blur-[120px]" />

      <div className="animate-in zoom-in-95 relative z-10 w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-xl duration-500 sm:p-10">
        {/* Logo Centralizada */}
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
                Esqueceu sua senha?
              </h1>
              <p className="text-sm font-medium text-gray-500">
                Digite o e-mail associado à sua conta e enviaremos um link para
                redefinir sua senha.
              </p>
            </div>

            {success === false && message && (
              <Alert className="mb-6 border-orange-500/10 bg-orange-500/5">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <AlertTitle className="font-bold text-orange-500 uppercase">
                  Erro ao solicitar
                </AlertTitle>
                <AlertDescription className="text-orange-900/70">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-bold text-gray-700"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="atleta@exemplo.com"
                  className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 font-medium text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 ${
                    errors?.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/50'
                  }`}
                />
                <FormError message={errors?.email?.[0]} />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 font-bold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
              >
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Enviar link de recuperação'
                )}
              </button>
            </form>
          </>
        ) : (
          /* Estado de Sucesso (Link Enviado) */
          <div className="animate-in fade-in slide-in-from-bottom-4 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500">
              <MailCheck className="h-8 w-8" />
            </div>
            <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-gray-900">
              Verifique seu E-mail
            </h2>
            <p className="mb-8 text-sm font-medium text-gray-500">
              Enviamos as instruções de recuperação para o e-mail informado. Não
              se esqueça de checar a caixa de spam.
            </p>
            <Link
              href="/auth/forgot-password"
              className="text-sm font-bold text-gray-500 transition-colors hover:text-gray-900"
            >
              Tentar com outro e-mail
            </Link>
          </div>
        )}

        <div className="mt-8 flex justify-center border-t border-gray-100 pt-6">
          <Link
            href="/auth/sign-in"
            className="flex items-center gap-2 text-sm font-bold text-gray-600 transition-colors hover:text-orange-500"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  )
}
