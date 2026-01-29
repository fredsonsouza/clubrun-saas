'use server'

import { signInWithPassword } from '@/http/sign-in-with-password'
import { HTTPError } from 'ky'
import z from 'zod'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const signInSchema = z.object({
  email: z.email({ message: 'Por favor, informe um e-mail válido!' }),
  password: z.string().min(1, { message: 'Por favor, informe sua senha!' }),
})

export async function signInWithEmailAndPassword(data: FormData) {
  const result = signInSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const errors = z.flattenError(result.error).fieldErrors

    return { success: false, message: null, errors }
  }

  const { email, password } = result.data

  try {
    const { token } = await signInWithPassword({
      email: String(email),
      password: String(password),
    })

    ;(await cookies()).set('token', token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, //7days
    })
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = await err.response.json()
      return { success: false, message, errors: null }
    }
    return {
      success: false,
      message: 'Erro inesperado, tente novamente em alguns minutos',
      errors: null,
    }
  }
  redirect('/')
}
