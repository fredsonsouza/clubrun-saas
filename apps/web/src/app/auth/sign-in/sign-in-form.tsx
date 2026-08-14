'use client'

import { FormError } from '@/components/form-error'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useFormState } from '@/hooks/use-form-state'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Flame,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { signInWithGoogle } from '../actions'
import { signInWithEmailAndPassword } from './actions'

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  const role = searchParams.get('role')
  const redirectTo = searchParams.get('redirectTo')

  const [{ success, errors, message }, handleSubmit, isPending] = useFormState(
    signInWithEmailAndPassword,
    () => {
      if (
        redirectTo?.startsWith('/') &&
        !redirectTo.startsWith('//') &&
        !redirectTo.includes('\\') &&
        !redirectTo.includes('://')
      ) {
        router.push(redirectTo)
      } else if (plan) {
        router.push(`/checkout?plan=${plan}${role ? `&role=${role}` : ''}`)
      } else if (role === 'owner') {
        router.push('/create-club')
      } else {
        router.push('/')
      }
    }
  )

  return (
    <div className="fade-in flex min-h-screen animate-in bg-white font-sans text-gray-900 duration-500">
      {/* LADO ESQUERDO: Inspiração */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gray-900 p-12 text-white lg:flex lg:w-1/2">
        <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-orange-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-1/2 w-full opacity-10">
          <svg
            aria-hidden="true"
            className="h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0 100 C 20 0 50 0 100 100 Z"
              fill="none"
              stroke="#f97316"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <Flame
              className="h-8 w-8 text-orange-500 transition-transform group-hover:scale-110"
              fill="currentColor"
            />
            <span className="font-extrabold text-2xl tracking-tight">
              Club<span className="text-orange-500">Run</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 font-medium text-gray-400 text-sm transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Link>
        </div>

        <div className="relative z-10 mb-10 max-w-md">
          <h1 className="mb-6 font-extrabold text-4xl leading-tight tracking-tight xl:text-5xl">
            Bem-vindo de volta ao pelotão.
          </h1>
          <ul className="space-y-4 font-medium text-gray-300">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" />{' '}
              Acompanhe o ranking atualizado do seu clube.
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" />{' '}
              Registre seus treinos e calcule seu pace.
            </li>
          </ul>
        </div>
        <div className="relative z-10 font-medium text-gray-500 text-xs">
          © 2026 ClubRun SaaS.
        </div>
      </div>

      {/* LADO DIREITO: Formulário */}
      <div className="relative flex w-full items-center justify-center bg-gray-50 p-6 sm:p-12 lg:w-1/2 lg:bg-white">
        <div className="relative z-10 w-full max-w-md space-y-8">
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <Flame className="h-8 w-8 text-orange-500" fill="currentColor" />
            <span className="font-extrabold text-3xl tracking-tight">
              Club<span className="text-orange-500">Run</span>
            </span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="mb-2 font-extrabold text-3xl text-gray-900 tracking-tight">
              Fazer Login
            </h2>
            <p className="font-medium text-gray-500 text-sm">
              Insira seus dados para acessar o painel do seu clube.
            </p>
          </div>

          {/* Error Alert */}
          {success === false && message && (
            <Alert className="border-orange-500/10 bg-orange-500/5">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <AlertTitle className="font-bold text-orange-500 uppercase">
                Falha no Login
              </AlertTitle>
              <AlertDescription className="text-orange-900/70">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {/* Botão do Google */}
          <form action={signInWithGoogle}>
            {redirectTo && (
              <input type="hidden" name="redirectTo" value={redirectTo} />
            )}

            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3.5 font-bold text-gray-700 text-sm shadow-sm transition-colors hover:bg-gray-50 active:scale-95"
            >
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Entrar com o Google
            </button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="grow border-gray-200 border-t" />
            <span className="shrink-0 px-4 font-bold text-gray-400 text-xs uppercase tracking-widest">
              Ou use seu e-mail
            </span>
            <div className="grow border-gray-200 border-t" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="login"
                className="font-bold text-gray-700 text-sm"
              >
                E-mail ou Usuário
              </label>
              <input
                id="login"
                name="login"
                type="text"
                required
                placeholder="atleta@exemplo.com ou username"
                className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 font-medium text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 ${
                  errors?.login || (success === false && message)
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/50'
                }`}
              />
              <FormError message={errors?.login?.[0]} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="font-bold text-gray-700 text-sm"
                >
                  Senha
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="font-bold text-orange-500 text-xs transition-colors hover:text-orange-600 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 font-medium text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 ${
                  errors?.password || (success === false && message)
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/50'
                }`}
              />
              <FormError message={errors?.password?.[0]} />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 font-bold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Entrar na conta <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <p className="pt-4 text-center font-medium text-gray-500 text-sm">
            Não tem uma conta?{' '}
            <Link
              href={`/auth/sign-up${plan || redirectTo ? `?${plan ? `plan=${plan}${role ? `&role=${role}` : ''}` : ''}${redirectTo ? `${plan ? '&' : ''}redirectTo=${encodeURIComponent(redirectTo)}` : ''}` : ''}`}
              className="font-bold text-orange-500 hover:underline"
            >
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
