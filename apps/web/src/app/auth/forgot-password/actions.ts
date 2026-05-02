'use server'

import { api } from '@/http/api-client'
import { HTTPError } from 'ky'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Por favor, informe um e-mail válido.' }),
})

export async function forgotPasswordAction(formData: FormData) {
  const result = forgotPasswordSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return { success: false, message: null, errors }
  }

  const { email } = result.data

  try {
    await api.post('password/recovery', {
      json: { email },
    })

    return { success: true, message: 'Link de recuperação enviado com sucesso!', errors: null }
  } catch (err) {
    if (err instanceof HTTPError) {
      try {
        const { message } = await err.response.json()
        return { success: false, message, errors: null }
      } catch {
        // Fallback for non-JSON errors
      }
    }

    return {
      success: false,
      message: 'Ocorreu um erro inesperado ao solicitar a recuperação. Tente novamente.',
      errors: null,
    }
  }
}
