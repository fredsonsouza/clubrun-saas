'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useFormState } from '@/hooks/use-form-state'
import { FormError } from '@/components/form-error'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Flame,
  Loader2,
  Trophy,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { signInWithGoogle } from '../actions'
import { signInUpAction } from './actions'

export function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const role = searchParams.get('role')
  const plan = searchParams.get('plan')
  const redirectTo = searchParams.get('redirectTo')
  const token = searchParams.get('token')
  const inviteId = searchParams.get('inviteId')
  const invitedEmail = searchParams.get('email')

  const [{ success, errors, message }, handleSubmit, isPending] = useFormState(
    signInUpAction,
    () => {
      const params = new URLSearchParams()
      if (role) params.set('role', role)
      if (plan) params.set('plan', plan)
      if (redirectTo) params.set('redirectTo', redirectTo)
      if (token) params.set('token', token)
      if (inviteId) params.set('inviteId', inviteId)

      const queryString = params.toString()
      router.push(`/auth/sign-in${queryString ? `?${queryString}` : ''}`)
    }
  )

  return (
    <div className="animate-in fade-in flex min-h-screen bg-white font-sans text-gray-900 duration-500">
      {/* LADO ESQUERDO */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gray-900 p-12 text-white lg:flex lg:w-1/2">
        <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-orange-500/20 blur-[100px]" />

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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wider text-white uppercase">
            <Trophy className="h-4 w-4 text-amber-400" /> Transforme seus
            resultados
          </div>
          <h1 className="mb-6 text-4xl leading-tight font-extrabold tracking-tight xl:text-5xl">
            Sua jornada começa aqui.
          </h1>
          <ul className="space-y-4 font-medium text-gray-300">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" /> Crie
              ou entre em um clube de corrida.
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" />{' '}
              Competitividade amigável e relatórios visuais.
            </li>
          </ul>
        </div>
        <div className="relative z-10 text-xs font-medium text-gray-500">
          © 2026 ClubRun SaaS. Construído para corredores.
        </div>
      </div>

      {/* LADO DIREITO */}
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
              Criar conta
            </h2>
            <p className="text-sm font-medium text-gray-500">
              Cadastre-se rapidamente para acessar a plataforma.
            </p>
          </div>

          {/* Error Alert */}
          {success === false && message && (
            <Alert className="border-orange-500/10 bg-orange-500/5">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <AlertTitle className="font-bold text-orange-500 uppercase">
                Falha no Registro
              </AlertTitle>
              <AlertDescription className="text-orange-900/70">
                {message}
              </AlertDescription>
            </Alert>
          )}

          <form action={signInWithGoogle}>
            {redirectTo && (
              <input type="hidden" name="redirectTo" value={redirectTo} />
            )}
            {token && <input type="hidden" name="token" value={token} />}
            {inviteId && (
              <input type="hidden" name="inviteId" value={inviteId} />
            )}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 active:scale-95"
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
              Cadastrar com o Google
            </button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="grow border-t border-gray-200"></div>
            <span className="shrink-0 px-4 text-xs font-bold tracking-widest text-gray-400 uppercase">
              Ou preencha seus dados
            </span>
            <div className="grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-bold text-gray-700">
                Nome Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Ex: Fredson Souza"
                className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 font-medium text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 ${
                  errors?.name
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/50'
                }`}
              />
              <FormError message={errors?.name?.[0]} />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="text-sm font-bold text-gray-700"
              >
                Nome de Usuário (Username)
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-gray-400">
                  @
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="seu.nome"
                  className={`w-full rounded-xl border bg-gray-50 py-3.5 pr-4 pl-10 font-medium text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 ${
                    errors?.username
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/50'
                  }`}
                />
              </div>
              <FormError message={errors?.username?.[0]} />
            </div>

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
                defaultValue={invitedEmail || ''}
                readOnly={!!invitedEmail}
                className={`w-full rounded-xl border ${invitedEmail ? 'bg-gray-100' : 'bg-gray-50'} px-4 py-3.5 font-medium text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 ${
                  errors?.email
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/50'
                }`}
              />
              <FormError message={errors?.email?.[0]} />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-bold text-gray-700"
              >
                Senha
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
                className="text-sm font-bold text-gray-700"
              >
                Confirmar Senha
              </label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                required
                placeholder="••••••••"
                className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 font-medium text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 ${
                  errors?.password_confirmation
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/50'
                }`}
              />
              <FormError message={errors?.password_confirmation?.[0]} />
            </div>

            <p className="text-center text-[10px] leading-relaxed font-medium text-gray-400 uppercase">
              Ao iniciar, você aceita nossa{' '}
              <Link href="/terms" className="text-orange-500 hover:underline">
                Privacidade
              </Link>{' '}
              e os{' '}
              <Link href="/terms" className="text-orange-500 hover:underline">
                Termos
              </Link>{' '}
              do ClubRun.
            </p>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 font-bold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Criar minha conta <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <p className="pt-4 text-center text-sm font-medium text-gray-500">
            Já possui conta?{' '}
            <Link
              href={`/auth/sign-in${plan || redirectTo ? `?${plan ? `plan=${plan}${role ? `&role=${role}` : ''}` : ''}${redirectTo ? `${plan ? '&' : ''}redirectTo=${redirectTo}` : ''}${token ? `&token=${token}` : ''}` : ''}`}
              className="font-bold text-orange-500 hover:underline"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
