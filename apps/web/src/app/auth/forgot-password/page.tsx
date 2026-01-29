import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPassword() {
  // const [submitted, setSubmitted] = useState(false)

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault()
  //   // Aqui você vai adicionar a lógica de recuperação
  //   setSubmitted(true)
  // }
  // if (submitted) {
  return (
    // <form action="" className="space-y-4">
    //   <h1 className="font-heading text-center text-xl font-semibold">
    //     Recuperar senha
    //   </h1>
    //   <p className="text-muted-foreground text-center text-sm">
    //     informe o e-mail cadastrado para recuperação da sua senha
    //   </p>

    //   <div className="space-y-1">
    //     <Label htmlFor="email">E-mail</Label>
    //     <Input name="email" type="email" id="email" />
    //   </div>

    //   <Button className="w-full transition hover:brightness-95 active:brightness-90">
    //     Recuperar senha
    //   </Button>

    //   <Button
    //     asChild
    //     size="sm"
    //     variant="link"
    //     className="w-full transition hover:brightness-95 active:brightness-90"
    //   >
    //     <Link href="/auth/sign-up">Fazer login em vez disso</Link>
    //   </Button>
    // </form>
    //     <div className="w-full space-y-6 text-center">
    //       {/* Success Icon */}
    //       <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
    //         <CheckCircle2 className="h-12 w-12 text-green-500" />
    //       </div>

    //       {/* Success Message */}
    //       <div className="space-y-2">
    //         <h1 className="font-heading text-3xl font-bold text-white">
    //           E-mail enviado!
    //         </h1>
    //         <p className="mx-auto max-w-sm text-zinc-400">
    //           Enviamos um link de recuperação para seu e-mail. Verifique sua caixa
    //           de entrada e spam.
    //         </p>
    //       </div>

    //       {/* Back to Login */}
    //       <Button
    //         asChild
    //         className="h-12 w-full bg-orange-500 font-semibold text-white transition-all hover:bg-orange-600 active:scale-[0.98]"
    //       >
    //         <Link href="/auth/sign-in">
    //           <ArrowLeft className="mr-2 h-5 w-5" />
    //           Voltar para o login
    //         </Link>
    //       </Button>

    //       {/* Resend Link */}
    //       <Button variant="ghost" className="w-full text-zinc-400 hover:text-white">
    //         Não recebeu? Enviar novamente
    //       </Button>
    //     </div>
    //   )
    // }

    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
          <Mail className="h-8 w-8 text-orange-500" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-white">
          Esqueceu sua senha?
        </h1>
        <p className="text-zinc-400">
          Sem problemas! Informe seu e-mail e enviaremos as instruções para
          recuperação
        </p>
      </div>

      {/* Form */}
      <form className="space-y-5">
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
              required
              className="h-12 border-zinc-700 bg-zinc-900 pl-10 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="h-12 w-full bg-orange-500 font-semibold text-white transition-all hover:bg-orange-600 active:scale-[0.98]"
        >
          Enviar link de recuperação
        </Button>

        {/* Back to Login */}
        <Button
          asChild
          variant="ghost"
          className="w-full text-zinc-400 hover:text-white"
        >
          <Link href="/auth/sign-in">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o login
          </Link>
        </Button>
      </form>

      {/* Help Text */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-sm text-zinc-400">
          <strong className="text-zinc-300">Dica:</strong> Se não encontrar o
          e-mail, verifique sua pasta de spam ou lixeira.
        </p>
      </div>
    </div>
  )
}
