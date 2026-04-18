import { isAuthenticated } from '@/auth/auth'
import { redirect } from 'next/navigation'

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Proteção da rota: se já estiver logado, manda direto para o app
  if (await isAuthenticated()) {
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
