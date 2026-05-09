'use client'

import React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  ArrowLeft,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { useFormState } from '@/hooks/use-form-state'
import { signInWithEmailAndPassword } from './actions'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithGoogle } from '../actions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  const role = searchParams.get('role')
  const redirectTo = searchParams.get('redirectTo')
  const token = searchParams.get('token')
  const inviteId = searchParams.get('inviteId')

  const [{ success, errors, message }, handleSubmit, isPending] = useFormState(
    signInWithEmailAndPassword,
    () => {
      if (redirectTo) {
        const params = new URLSearchParams()
        if (token) params.set('token', token)
        if (inviteId) params.set('inviteId', inviteId)
        const queryString = params.toString()
        router.push(`${redirectTo}${queryString ? `?${queryString}` : ''}`)
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
    <div className="animate-in fade-in flex min-h-screen bg-white font-sans text-gray-900 duration-500">
      {/* LADO ESQUERDO: Inspiração */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gray-900 p-12 text-white lg:flex lg:w-1/2">
        <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-orange-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-1/2 w-full opacity-10">
          <svg
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
            <span className="text-2xl font-extrabold tracking-tight">
              Club<span className="text-orange-500">Run</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Link>
        </div>

        <div className="relative z-10 mb-10 max-w-md">
          <h1 className="mb-6 text-4xl leading-tight font-extrabold tracking-tight xl:text-5xl">
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
        <div className="relative z-10 text-xs font-medium text-gray-500">
          © 2026 ClubRun SaaS.
        </div>
      </div>

      {/* LADO DIREITO: Formulário */}
      <div className="relative flex w-full items-center justify-center bg-gray-50 p-6 sm:p-12 lg:w-1/2 lg:bg-white">
        <div className="relative z-10 w-full max-w-md space-y-8">
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <Flame className="h-8 w-8 text-orange-500" fill="currentColor" />
            <span className="text-3xl font-extrabold tracking-tight">
              Club<span className="text-orange-500">Run</span>
            </span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900">
              Fazer Login
            </h2>
            <p className="text-sm font-medium text-gray-500">
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
            {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
            {token && <input type="hidden" name="token" value={token} />}
            {inviteId && <input type="hidden" name="inviteId" value={inviteId} />}
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 active:scale-95"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
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
            <div className="grow border-t border-gray-200"></div>
            <span className="shrink-0 px-4 text-xs font-bold tracking-widest text-gray-400 uppercase">
              Ou use seu e-mail
            </span>
            <div className="grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="login"
                className="text-sm font-bold text-gray-700"
              >
                E-mail ou Usuário
              </label>
              <input
                id="login"
                name="login"
                type="text"
                required
                placeholder="atleta@exemplo.com ou username"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 font-medium text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
              />
              {errors?.login && (
                <p className="text-xs font-bold text-orange-600">
                  {errors.login[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-bold text-gray-700"
                >
                  Senha
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-bold text-orange-500 transition-colors hover:text-orange-600 hover:underline"
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
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 font-medium text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:outline-none"
              />
              {errors?.password && (
                <p className="text-xs font-bold text-orange-600">
                  {errors.password[0]}
                </p>
              )}
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

          <p className="pt-4 text-center text-sm font-medium text-gray-500">
            Não tem uma conta?{' '}
            <Link
              href={`/auth/sign-up${plan || redirectTo ? `?${plan ? `plan=${plan}${role ? `&role=${role}` : ''}` : ''}${redirectTo ? `${plan ? '&' : ''}redirectTo=${redirectTo}` : ''}${token ? `&token=${token}` : ''}` : ''}`}
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
