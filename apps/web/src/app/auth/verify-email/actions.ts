'use server'

import { api } from '@/http/api-client'
import { HTTPError } from 'ky'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  code: z.string().length(6, { message: 'O código deve ter 6 dígitos.' }),
})

export async function verifyEmailAction(formData: FormData) {
  const result = verifyEmailSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return { success: false, message: null, errors }
  }

  const { code } = result.data

  try {
    await api.post('auth/verify-email', {
      json: { code },
    })

    return { success: true, message: 'E-mail verificado com sucesso!', errors: null }
  } catch (err) {
    if (err instanceof HTTPError) {
      try {
        const { message } = await err.response.json()
        return { success: false, message, errors: null }
      } catch {
        // Fallback
      }
    }

    return {
      success: false,
      message: 'Ocorreu um erro ao verificar o e-mail. Verifique o código e tente novamente.',
      errors: null,
    }
  }
}

export async function resendVerificationAction() {
  try {
    await api.post('auth/resend-verification')
    return { success: true, message: 'Um novo código foi enviado para o seu e-mail.' }
  } catch (err) {
    if (err instanceof HTTPError) {
      try {
        const { message } = await err.response.json()
        return { success: false, message }
      } catch {
        // Fallback
      }
    }

    return {
      success: false,
      message: 'Erro ao reenviar código, tente novamente em instantes.',
    }
  }
}
