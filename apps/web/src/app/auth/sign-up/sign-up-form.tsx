'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

import googleIcon from '@/app/assets/google-icon.svg'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useFormState } from '@/hooks/use-form-state'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Loader2, Mail, User, Lock } from 'lucide-react'
import { signInWithGoogle } from '../actions'
import { signInUpAction } from './actions'

export function SignUpForm() {
  const router = useRouter()
  const [{ success, errors, message }, handleSubmit, isPending] = useFormState(
    signInUpAction,
    () => {
      router.push('/auth/sign-in')
    }
  )
  return (
    // <div className="space-y-4">
    //   <form onSubmit={handleSubmit} className="space-y-4">
    //     <h1 className="font-heading text-center text-xl font-semibold">
    //       Criar conta
    //     </h1>
    //     <p className="text-muted-foreground text-center text-sm">
    //       Gerencie seus treinos e evolua com seu clube
    //     </p>

    //     {success === false && message && (
    //       <Alert variant="destructive">
    //         <AlertTriangle className="size-4" />
    //         <AlertTitle>Sign in failed</AlertTitle>
    //         <AlertDescription>
    //           <p>{message}</p>
    //         </AlertDescription>
    //       </Alert>
    //     )}

    //     <div className="space-y-1">
    //       <Label htmlFor="name">Nome</Label>
    //       <Input name="name" id="name" />

    //       {errors?.name && (
    //         <p className="text-xs font-medium text-red-500 dark:text-red-400">
    //           {errors.name[0]}
    //         </p>
    //       )}
    //     </div>

    //     <div className="space-y-1">
    //       <Label htmlFor="email">E-mail</Label>
    //       <Input name="email" type="email" id="email" />

    //       {errors?.email && (
    //         <p className="text-xs font-medium text-red-500 dark:text-red-400">
    //           {errors.email[0]}
    //         </p>
    //       )}
    //     </div>

    //     <div className="space-y-1">
    //       <Label htmlFor="password">Senha</Label>
    //       <Input name="password" type="password" id="password" />

    //       {errors?.password && (
    //         <p className="text-xs font-medium text-red-500 dark:text-red-400">
    //           {errors.password[0]}
    //         </p>
    //       )}
    //     </div>

    //     <div className="space-y-1">
    //       <Label htmlFor="password_confirmation">Confirme sua senha</Label>
    //       <Input
    //         name="password_confirmation"
    //         type="password"
    //         id="password_confirmation"
    //       />

    //       {errors?.password_confirmation && (
    //         <p className="text-xs font-medium text-red-500 dark:text-red-400">
    //           {errors.password_confirmation[0]}
    //         </p>
    //       )}
    //     </div>

    //     <Button
    //       disabled={isPending}
    //       className="w-full transition hover:brightness-95 active:brightness-90"
    //     >
    //       {isPending ? (
    //         <Loader2 className="sizer-4 animate-spin" />
    //       ) : (
    //         'Criar Conta'
    //       )}
    //     </Button>

    //     <Button
    //       asChild
    //       size="sm"
    //       variant="link"
    //       className="w-full transition hover:brightness-95 active:brightness-90"
    //     >
    //       <Link href="/auth/sign-in">Já possui conta? Entrar</Link>
    //     </Button>
    //   </form>
    //   <Separator />

    //   <form action={signInWithGoogle}>
    //     <Button type="submit" variant="outline" className="w-full">
    //       <Image src={googleIcon} alt="" className="size-4"></Image>
    //       Entrar com Google
    //     </Button>
    //   </form>
    // </div>
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        {/* <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
          <div className="bg-gradient-orange h-10 w-10 rounded-full"></div>
        </div> */}
        <h1 className="font-heading text-3xl font-bold text-white">
          Crie sua conta
        </h1>
        <p className="text-zinc-400">
          Junte-se ao ClubRun e evolua seus treinos
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {success === false && message && (
          <Alert className="border-red-500/20 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertTitle className="text-red-500">
              Erro ao criar conta
            </AlertTitle>
            <AlertDescription className="text-red-400">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-zinc-200">
            Nome completo
          </Label>
          <div className="relative">
            <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            <Input
              name="name"
              id="name"
              placeholder="Seu nome"
              className="h-12 border-zinc-700 bg-zinc-900 pl-10 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          {errors?.name && (
            <p className="text-xs font-medium text-red-400">{errors.name[0]}</p>
          )}
        </div>

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
        </div>

        {/* Password Confirmation Field */}
        <div className="space-y-2">
          <Label
            htmlFor="password_confirmation"
            className="text-sm font-medium text-zinc-200"
          >
            Confirme sua senha
          </Label>
          <div className="relative">
            <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            <Input
              name="password_confirmation"
              type="password"
              id="password_confirmation"
              placeholder="••••••••"
              className="h-12 border-zinc-700 bg-zinc-900 pl-10 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          {errors?.password_confirmation && (
            <p className="text-xs font-medium text-red-400">
              {errors.password_confirmation[0]}
            </p>
          )}
        </div>

        {/* Terms */}
        <p className="text-xs text-zinc-500">
          Ao criar uma conta, você concorda com nossos{' '}
          <Link href="/terms" className="text-orange-500 hover:underline">
            Termos de Uso
          </Link>{' '}
          e{' '}
          <Link href="/privacy" className="text-orange-500 hover:underline">
            Política de Privacidade
          </Link>
        </p>

        {/* Submit Button */}
        <Button
          disabled={isPending}
          type="submit"
          className="h-12 w-full bg-orange-500 font-semibold text-white transition-all hover:bg-orange-600 active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Criar conta'
          )}
        </Button>

        {/* Sign In Link */}
        <p className="text-center text-sm text-zinc-400">
          Já tem uma conta?{' '}
          <Link
            href="/auth/sign-in"
            className="font-semibold text-orange-500 transition-colors hover:text-orange-400"
          >
            Entrar
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
        <Button
          type="submit"
          variant="outline"
          className="h-12 w-full border-zinc-700 bg-zinc-900 font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
        >
          <Image src={googleIcon} alt="Google" className="mr-2 h-5 w-5" />
          Cadastrar com Google
        </Button>
      </form>
    </div>
  )
}
