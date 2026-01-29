'use server'

import { signUp } from '@/http/sign-up'
import { HTTPError } from 'ky'
import { redirect } from 'next/navigation'
import z from 'zod'

const signUpSchema = z
  .object({
    name: z.string().refine((value) => value.split(' ').length > 1, {
      message: 'Por favor, informe seu nome completo!',
    }),
    email: z.email({ message: 'Por favor, informe um e-mail válido!' }),
    password: z
      .string()
      .min(6, { message: 'Senha dver ter pelo menos 6 caracteres.' }),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Confirmação de senha não combinam',
    path: ['password_confirmation'],
  })

export async function signInUpAction(data: FormData) {
  const result = signUpSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const errors = z.flattenError(result.error).fieldErrors

    return { success: false, message: null, errors }
  }
  const { name, password, email } = result.data

  try {
    await signUp({
      name,
      email,
      password,
    })
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = await err.response.json() //pega a mensagem do nosso back-end

      return { success: false, message, errors: null }
    }

    console.error(err)

    return {
      success: false,
      message: 'Unexpected error, try again in few minutes',
      errors: null,
    }
  }

  redirect('/')
}
