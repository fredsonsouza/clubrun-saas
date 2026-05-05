import { auth } from '@/auth/auth'
import { redirect } from 'next/navigation'

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user } = await auth().catch(() => ({ user: null }))

  // Se estiver logado E verificado, não faz sentido estar nas páginas de auth (login/cadastro)
  // Mas se estiver logado e NÃO verificado, ele PODE estar na página de verificação.
  if (user && user.emailVerifiedAt) {
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased selection:bg-orange-500 selection:text-white">
      {/* O layout agora é apenas um invólucro (wrapper) limpo. 
        O design visual completo (como o Split-Screen do Sign-in/Sign-up 
        ou o Cartão Centralizado do Forgot Password) será renderizado 
        pelos respectivos arquivos page.tsx injetados aqui.
      */}
      {children}
    </main>
  )
}
