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
    username: z
      .string()
      .min(3, { message: 'Username deve ter pelo menos 3 caracteres.' })
      .regex(/^[a-zA-Z0-9._-]+$/, {
        message:
          'Username só pode conter letras, números, pontos, underscores e hífens.',
      }),
    email: z.email({ message: 'Por favor, informe um e-mail válido!' }),
    password: z
      .string()
      .min(12, { message: 'A senha deve ter pelo menos 12 caracteres.' })
      .max(128, { message: 'A senha deve ter no máximo 128 caracteres.' }),
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
  const { name, username, password, email } = result.data

  try {
    await signUp({
      name,
      username,
      email,
      password,
    })
  } catch (err) {
    if (err instanceof HTTPError) {
      let { message } = await err.response.json()
      if (
        message === 'User already exists with same email' ||
        message === 'Já existe uma conta cadastrada com este e-mail.'
      ) {
        message = 'Este e-mail já está sendo utilizado por outra conta.'
      } else if (
        message === 'User already exists with same username' ||
        message === 'Este nome de usuário já está em uso.'
      ) {
        message = 'Este nome de usuário já está sendo utilizado.'
      }
      return { success: false, message, errors: null }
    }

    console.error(err)

    return {
      success: false,
      message: 'Erro inesperado, tente novamente em alguns minutos.',
      errors: null,
    }
  }

  return { success: true, message: null, errors: null }
}
