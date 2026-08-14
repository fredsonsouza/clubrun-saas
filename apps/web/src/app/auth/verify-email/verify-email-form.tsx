'use client'

import { FormError } from '@/components/form-error'
import { useFormState } from '@/hooks/use-form-state'
import { AlertCircle, CheckCircle2, Loader2, LogOut } from 'lucide-react'

import { useEffect, useRef, useState, useTransition } from 'react'
import { resendVerificationAction, verifyEmailAction } from './actions'

export function VerifyEmailForm() {
  const [isResending, startResendTransition] = useTransition()
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [resendStatus, setResendStatus] = useState<{
    success?: boolean
    message?: string
  } | null>(null)

  const [{ success, message, errors }, handleSubmit, isPending] = useFormState(
    verifyEmailAction,
    () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
      redirectTimerRef.current = setTimeout(() => {
        window.location.href = '/explore'
      }, 2000)
    }
  )

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
      if (resendTimerRef.current) clearTimeout(resendTimerRef.current)
    }
  }, [])

  async function handleResend() {
    startResendTransition(async () => {
      const result = await resendVerificationAction()
      setResendStatus(result)

      if (resendTimerRef.current) clearTimeout(resendTimerRef.current)
      resendTimerRef.current = setTimeout(() => setResendStatus(null), 5000)
    })
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
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
              className={`block w-full rounded-xl border px-4 py-4 text-center font-bold text-3xl text-gray-900 tracking-[1em] placeholder:text-gray-300 placeholder:tracking-normal focus:outline-none focus:ring-2 ${
                errors?.code
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500/20'
              }`}
            />
            <FormError message={errors?.code?.[0]} />
          </div>
        </div>

        {message && !success && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <p>{message}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-600 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <p>{message} Redirecionando...</p>
          </div>
        )}

        {resendStatus && (
          <div
            className={`flex items-center gap-2 rounded-lg p-3 text-sm ${resendStatus.success ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}
          >
            {resendStatus.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <p>{resendStatus.message}</p>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isPending || success}
            className="group relative flex w-full justify-center rounded-xl bg-orange-600 px-4 py-4 font-bold text-sm text-white transition-all hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'VERIFICAR E-MAIL'
            )}
          </button>
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-sm">
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

      <div className="border-gray-100 border-t pt-6 text-center">
        <a
          href="/api/auth/sign-out"
          className="inline-flex items-center gap-2 font-medium text-gray-400 text-sm transition-colors hover:text-gray-600"
        >
          <LogOut className="h-4 w-4" />
          Sair ou usar outro e-mail
        </a>
      </div>
    </div>
  )
}
