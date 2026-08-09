import { resend } from '@/lib/mail'
import { prisma } from '@/lib/prisma'
import { env } from '@saas/env'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function requestPasswordRecovery(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/password/recovery',
    {
      schema: {
        tags: ['auth'],
        summary: 'Request password recovery',
        body: z.object({
          email: z.email(),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body

      const userFromEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      // We don't want people to know if user really exists!
      if (!userFromEmail) {
        return reply.status(201).send(null)
      }

      const { id: code } = await prisma.token.create({
        data: {
          type: 'PASSWORD_RECOVER',
          userId: userFromEmail.id,
        },
      })

      // Enviar e-mail via Resend
      try {
        await resend.emails.send({
          from: 'ClubRun <onboarding@resend.dev>',
          to: email,
          subject: 'Recuperação de Senha - ClubRun',
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #111;">
              <h2 style="color: #f97316;">Recuperação de Senha</h2>
              <p>Olá,</p>
              <p>Recebemos uma solicitação para redefinir a senha da sua conta no ClubRun.</p>
              <p>Para prosseguir, clique no botão abaixo:</p>
              <div style="margin-top: 24px;">
                <a href="${env.NEXT_PUBLIC_APP_URL}/auth/reset-password?code=${code}"
                   style="background-color: #f97316; color: #fff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">
                   REDEFINIR SENHA
                </a>
              </div>
              <p style="margin-top: 32px; font-size: 12px; color: #666;">Se você não solicitou esta redefinição, pode ignorar este e-mail.</p>
              <hr />
              <p style="color: #999; font-size: 10px;">ClubRun SaaS - Pelotão de Elite</p>
            </div>
          `,
        })
      } catch (error) {
        console.error('Falha ao enviar e-mail de recuperação:', error)
      }

      return reply.status(201).send(null)
    }
  )
}
