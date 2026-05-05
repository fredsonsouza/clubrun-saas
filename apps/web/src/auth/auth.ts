import { getProfile } from '@/http/get-profile'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function isAuthenticated() {
  return !!(await cookies()).get('token')?.value
}

export async function auth() {
  const token = (await cookies()).get('token')?.value

  if (!token) {
    redirect('/')
  }

  try {
    const { user } = await getProfile()
    if (!user.id) {
      redirect('/api/auth/sign-out')
    }

    // Se o e-mail não estiver verificado e o usuário não estiver na página de verificação, redireciona
    // Nota: Precisamos de uma forma de saber a URL atual, mas em Server Components usamos headers ou passamos via prop.
    // Para simplificar aqui, deixaremos a lógica de redirecionamento para o Middleware ou para as páginas.
    
    return {
      user: {
        ...user,
        id: user.id as string,
        emailVerifiedAt: user.emailVerifiedAt,
      },
      token,
    }
  } catch (error) {
  }

  return { user: null }
}
