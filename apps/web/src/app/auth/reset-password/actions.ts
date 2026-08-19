'use server'

import { mutationApi } from '@/http/api-client'
import { HTTPError } from 'ky'
import { z } from 'zod'

const resetPasswordSchema = z
  .object({
    code: z.string(),
    password: z
      .string()
      .min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
      .max(128, { message: 'A senha deve ter no máximo 128 caracteres.' }),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'As senhas não coincidem.',
    path: ['password_confirmation'],
  })

export async function resetPasswordAction(formData: FormData) {
  const result = resetPasswordSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return { success: false, message: null, errors }
  }

  const { code, password } = result.data

  try {
    await mutationApi.post('password/reset', {
      json: { code, password },
    })

    return {
      success: true,
      message: 'Senha redefinida com sucesso!',
      errors: null,
    }
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
      message:
        'Ocorreu um erro ao redefinir sua senha. O link pode ter expirado.',
      errors: null,
    }
  }
}
