import { getProfile } from '@/http/get-profile'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function isAuthenticated() {
  return !!(await cookies()).get('token')?.value
}

export async function auth() {
  const token = (await cookies()).get('token')?.value

  if (!token) {
    redirect('/auth/sign-in')
  }

  try {
    const { user } = await getProfile()
    if (!user.id) {
      redirect('/api/auth/sign-out')
    }
    return {
      user: {
        ...user,
        id: user.id,
      },
    }
  } catch {}
  redirect('/api/auth/sign-out')
}
