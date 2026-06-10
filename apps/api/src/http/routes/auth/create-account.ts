import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { createAuditLog } from '@/utils/audit-log'
import { resend } from '@/lib/mail'

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        summary: 'Create a new account',
        tags: ['auth'],
        body: z.object({
          name: z.string(),
          username: z.string().min(3).regex(/^[a-zA-Z0-9._-]+$/),
          email: z.email(),
          password: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { name, username, email, password } = request.body

      const userWithSameEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (userWithSameEmail) {
        throw new BadRequestError('User with same e-mail already exists!')
      }

      const userWithSameUsername = await prisma.user.findUnique({
        where: { username },
      })

      if (userWithSameUsername) {
        throw new BadRequestError('Username already taken!')
      }

      const [, domain] = email.split('@')

      const [autoJoinClub, pendingInvite] = await Promise.all([
        prisma.club.findFirst({
          where: {
            domain,
            shouldAttachUsersByDomain: true,
          },
        }),
        prisma.invite.findFirst({
          where: {
            email,
          },
        }),
      ])

      const passwordHash = await hash(password, 6)

      const user = await prisma.user.create({
        data: {
          name,
          username,
          email,
          passwordHash,
          athleteProfile: {
            create: {
              isPublic: true,
              birthDate: new Date('2000-01-01'),
            },
          },
          members_on: {
            create: [
              ...(autoJoinClub ? [{ clubId: autoJoinClub.id }] : []),
              ...(pendingInvite ? [{ clubId: pendingInvite.clubId, role: pendingInvite.role }] : []),
            ],
          },
        },
      })

      // Se havia um convite, deletamos ele agora que foi "aceito"
      if (pendingInvite) {
        await prisma.invite.delete({
          where: { id: pendingInvite.id },
        })
      }

      await createAuditLog({
        userId: user.id,
        action: 'CREATE_ACCOUNT',
        entity: 'USER',
        entityId: user.id,
        payload: { email: user.email, username: user.username },
      })

      // Gerar código de verificação de 6 dígitos
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

      await prisma.token.create({
        data: {
          type: 'EMAIL_VERIFICATION',
          code: verificationCode,
          userId: user.id,
        },
      })

      // Enviar e-mail de verificação
      try {
        await resend.emails.send({
          from: 'ClubRun <onboarding@resend.dev>',
          to: email,
          subject: 'Verifique seu e-mail no ClubRun',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f97316;">Bem-vindo ao ClubRun!</h2>
              <p>Ficamos felizes em ter você conosco. Para começar, use o código abaixo para verificar seu e-mail:</p>
              <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937; border-radius: 8px;">
                ${verificationCode}
              </div>
              <p style="margin-top: 20px;">Esse código expira em breve. Se você não criou uma conta no ClubRun, ignore este e-mail.</p>
              <hr style="margin: 30px 0; border: 0; border-top: 1px solid #e5e7eb;" />
              <p style="color: #6b7280; font-size: 12px; text-align: center;">ClubRun SaaS - A plataforma para clubes de corrida profissionais.</p>
            </div>
          `,
        })
      } catch (mailError) {
        console.error('[MAIL-ERROR] Falha ao enviar e-mail:', mailError)
        // Não travamos o cadastro se o e-mail falhar, mas logamos o erro
      }

      return reply.status(201).send()
    }
  )
}
