import { resend } from '@/lib/mail'
import { prisma } from '@/lib/prisma'
import { authRateLimit } from '@/utils/auth-rate-limit'
import { hashPassword, normalizeEmail, passwordSchema } from '@/utils/identity'
import {
  EMAIL_VERIFICATION_TTL_MS,
  issueOtpInTransaction,
} from '@/utils/tokens'
import { createAuditLog } from '@/utils/audit-log'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      config: authRateLimit((request) => {
        const body = (request.body ?? {}) as { email?: string }
        return normalizeEmail(body.email ?? '')
      }),
      schema: {
        summary: 'Create a new account',
        tags: ['auth'],
        body: z.object({
          name: z.string(),
          username: z
            .string()
            .min(3)
            .regex(/^[a-zA-Z0-9._-]+$/),
          email: z.string().transform(normalizeEmail).pipe(z.email()),
          password: passwordSchema,
        }),
      },
    },
    async (request, reply) => {
      const { name, username, password } = request.body
      const email = normalizeEmail(request.body.email)

      const [userWithSameEmail, userWithSameUsername] = await Promise.all([
        prisma.user.findUnique({ where: { email }, select: { id: true } }),
        prisma.user.findUnique({ where: { username }, select: { id: true } }),
      ])

      if (userWithSameEmail) {
        throw new BadRequestError('User with same e-mail already exists!')
      }
      if (userWithSameUsername) {
        throw new BadRequestError('Username already taken!')
      }

      const passwordHash = await hashPassword(password)
      const { user, verificationCode } = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
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
          },
          select: { id: true, username: true },
        })
        const verificationCode = await issueOtpInTransaction(
          tx,
          user.id,
          'EMAIL_VERIFICATION',
          EMAIL_VERIFICATION_TTL_MS
        )
        return { user, verificationCode }
      })

      createAuditLog({
        userId: user.id,
        action: 'CREATE_ACCOUNT',
        entity: 'USER',
        entityId: user.id,
        payload: { username: user.username },
      })

      try {
        await resend.emails.send({
          from: 'ClubRun <onboarding@resend.dev>',
          to: email,
          subject: 'Verifique seu e-mail no ClubRun',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f97316;">Bem-vindo ao ClubRun!</h2>
              <p>Use o código abaixo para verificar seu e-mail:</p>
              <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px;">
                ${verificationCode}
              </div>
              <p>O código expira em 15 minutos.</p>
            </div>`,
        })
      } catch (error) {
        console.error('[MAIL-ERROR] Verification delivery failed', error)
      }

      return reply.status(201).send()
    }
  )
}
