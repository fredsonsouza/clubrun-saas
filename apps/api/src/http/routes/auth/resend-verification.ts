import { auth } from '@/http/middlewares/auth'
import { resend } from '@/lib/mail'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function resendVerification(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/auth/resend-verification',
      {
        schema: {
          tags: ['auth'],
          summary: 'Resend verification code',
          security: [{ bearerAuth: [] }],
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const user = await prisma.user.findUnique({
          where: { id: userId },
        })

        if (!user) {
          throw new UnauthorizedError('User not found.')
        }

        // Deleta tokens antigos de verificação
        await prisma.token.deleteMany({
          where: {
            userId,
            type: 'EMAIL_VERIFICATION',
          },
        })

        // Gera novo código de 6 dígitos
        const code = Math.floor(100000 + Math.random() * 900000).toString()

        await prisma.token.create({
          data: {
            code,
            type: 'EMAIL_VERIFICATION',
            userId,
          },
        })

        // Envia o e-mail via Resend
        try {
          await resend.emails.send({
            from: 'ClubRun <onboarding@resend.dev>', // No futuro usar seu domínio
            to: user.email,
            subject: `Seu novo código de verificação: ${code}`,
            html: `
              <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                <h2>Olá, ${user.name}!</h2>
                <p>Você solicitou um novo código de verificação para sua conta no ClubRun.</p>
                <p>Utilize o código abaixo para validar seu e-mail:</p>
                <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #f97316;">
                  ${code}
                </div>
                <p>Este código expira em breve. Se você não solicitou este reenvio, pode ignorar este e-mail.</p>
                <hr />
                <p>Bons treinos,<br />Equipe ClubRun</p>
              </div>
            `,
          })
        } catch (mailError) {
          console.error('[MAIL-ERROR] Falha ao reenviar e-mail:', mailError)
        }

        return reply.status(204).send()
      }
    )
}
