'use client'

import { AlertTriangle, Loader2, Mail, Lock } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import googleIcon from '@/app/assets/google-icon.svg'
import Image from 'next/image'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useFormState } from '@/hooks/use-form-state'
import { signInWithEmailAndPassword } from './actions'
import { useRouter } from 'next/navigation'
import { signInWithGoogle } from '../actions'
import { Logo } from '@/components/brand/logo'

export function SignInForm() {
  const router = useRouter()
  const [{ success, errors, message }, handleSubmit, isPending] = useFormState(
    signInWithEmailAndPassword,
    () => {
      router.push('/')
    }
  )
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        {/* <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
          <div className="h-10 w-10 rounded-full bg-orange-500"></div>
        </div> */}
        <h1 className="font-heading text-3xl font-bold text-white">
          Bem-vindo de volta
        </h1>
        <p className="text-zinc-400">
          Acesse sua conta e continue seus treinos
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error Alert */}
        {success === false && message && (
          <Alert className="border-red-500/20 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertTitle className="text-red-500">Erro ao entrar</AlertTitle>
            <AlertDescription className="text-red-400">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-zinc-200">
            E-mail
          </Label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            <Input
              name="email"
              type="email"
              id="email"
              placeholder="seu@email.com"
              className="h-12 border-zinc-700 bg-zinc-900 pl-10 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          {errors?.email && (
            <p className="text-xs font-medium text-red-400">
              {errors.email[0]}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-zinc-200"
          >
            Senha
          </Label>
          <div className="relative">
            <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            <Input
              name="password"
              type="password"
              id="password"
              placeholder="••••••••"
              className="h-12 border-zinc-700 bg-zinc-900 pl-10 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          {errors?.password && (
            <p className="text-xs font-medium text-red-400">
              {errors.password[0]}
            </p>
          )}
          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-orange-500 transition-colors hover:text-orange-400"
            >
              Esqueceu sua senha?
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          disabled={isPending}
          type="submit"
          className="h-12 w-full bg-orange-500 font-semibold text-white transition-all hover:bg-orange-600 active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Entrar'}
        </Button>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-zinc-400">
          Não tem uma conta?{' '}
          <Link
            href="/auth/sign-up"
            className="font-semibold text-orange-500 transition-colors hover:text-orange-400"
          >
            Criar conta
          </Link>
        </p>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="bg-zinc-800" />
        </div>

        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-950 px-2 text-zinc-500">
            ou continue com
          </span>
        </div>
      </div>

      {/* Google Sign In */}
      <form action={signInWithGoogle}>
        {/* <Button
          type="submit"
          variant="outline"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
        >
          <Image src={googleIcon} alt="Google" className="mr-2 h-5 w-5" />
          Entrar com Google
        </Button> */}

        <button className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98]">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Entrar com Google
        </button>
      </form>
    </div>
  )
}
