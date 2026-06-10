'use client'

import { useRouter } from 'next/navigation'
import { useFormState } from '@/hooks/use-form-state'
import { verifyEmailAction, resendVerificationAction } from './actions'
import { AlertCircle, CheckCircle2, Loader2, LogOut } from 'lucide-react'
import { useState, useTransition } from 'react'

export function VerifyEmailForm() {
  const router = useRouter()
  const [isResending, startResendTransition] = useTransition()
  const [resendStatus, setResendStatus] = useState<{ success?: boolean, message?: string } | null>(null)

  const [{ success, message, errors }, handleSubmit, isPending] = useFormState(
    verifyEmailAction,
    () => {
      // On success
      setTimeout(() => {
        window.location.href = '/explore'
      }, 2000)
    }
  )

  async function handleResend() {
    startResendTransition(async () => {
      const result = await resendVerificationAction()
      setResendStatus(result)
      
      // Limpa a mensagem após 5 segundos
      setTimeout(() => setResendStatus(null), 5000)
    })
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="code" className="sr-only">
              Código de Verificação
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              maxLength={6}
              placeholder="000000"
              className="block w-full rounded-xl border border-gray-300 px-4 py-4 text-center text-3xl font-bold tracking-[1em] text-gray-900 placeholder:text-gray-300 placeholder:tracking-normal focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            {errors?.code && (
              <p className="mt-2 text-xs text-red-500">{errors.code[0]}</p>
            )}
          </div>
        </div>

        {message && !success && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <p>{message}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <p>{message} Redirecionando...</p>
          </div>
        )}

        {resendStatus && (
          <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${resendStatus.success ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
            {resendStatus.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <p>{resendStatus.message}</p>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isPending || success}
            className="group relative flex w-full justify-center rounded-xl bg-orange-600 px-4 py-4 text-sm font-bold text-white transition-all hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'VERIFICAR E-MAIL'
            )}
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Não recebeu o código?{' '}
            <button
              type="button"
              disabled={isResending || success}
              className="font-medium text-orange-600 hover:text-orange-500 disabled:opacity-50"
              onClick={handleResend}
            >
              {isResending ? 'Enviando...' : 'Reenviar código'}
            </button>
          </p>
        </div>
      </form>

      <div className="border-t border-gray-100 pt-6 text-center">
        <a 
          href="/api/auth/sign-out"
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('clubrun:athlete_subscribed')
            }
          }}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-600"
        >
          <LogOut className="h-4 w-4" />
          Sair ou usar outro e-mail
        </a>
      </div>
    </div>
  )
}
