import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { authRateLimit } from '@/utils/auth-rate-limit'
import { normalizeEmail } from '@/utils/identity'
import { consumeOtpInTransaction } from '@/utils/tokens'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

export async function verifyEmail(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/auth/verify-email',
      {
        config: authRateLimit((request) => {
          const body = (request.body ?? {}) as { code?: string }
          return body.code ?? ''
        }),
        schema: {
          tags: ['auth'],
          summary: 'Verify user email',
          security: [{ bearerAuth: [] }],
          body: z.object({ code: z.string().regex(/^\d{6}$/) }),
          response: { 204: z.null() },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId({ allowUnverified: true })
        const verified = await prisma.$transaction(async (tx) => {
          const consumed = await consumeOtpInTransaction(
            tx,
            userId,
            request.body.code,
            'EMAIL_VERIFICATION'
          )
          if (!consumed) return false

          const user = await tx.user.findUnique({
            where: { id: userId },
            select: { email: true },
          })
          if (!user) return false

          const email = normalizeEmail(user.email)
          const domain = email.split('@')[1]
          const invites = await tx.invite.findMany({
            where: { email },
            select: { id: true, clubId: true, role: true },
          })
          const invitedClubIds = new Set(invites.map((invite) => invite.clubId))
          const domainClubs = domain
            ? await tx.club.findMany({
                where: { domain, shouldAttachUsersByDomain: true },
                select: { id: true },
              })
            : []

          await tx.user.update({
            where: { id: userId },
            data: { emailVerifiedAt: new Date() },
          })

          for (const invite of invites) {
            await tx.member.upsert({
              where: { clubId_userId: { clubId: invite.clubId, userId } },
              create: {
                clubId: invite.clubId,
                userId,
                role: invite.role,
                status: 'ACTIVE',
              },
              update: { role: invite.role, status: 'ACTIVE' },
            })
          }

          for (const club of domainClubs) {
            if (invitedClubIds.has(club.id)) continue
            await tx.member.upsert({
              where: { clubId_userId: { clubId: club.id, userId } },
              create: {
                clubId: club.id,
                userId,
                role: 'ATHLETE',
                status: 'PENDING',
              },
              update: {},
            })
          }

          if (invites.length > 0) {
            await tx.invite.deleteMany({
              where: { id: { in: invites.map((invite) => invite.id) } },
            })
          }
          return true
        })

        if (!verified) {
          throw new BadRequestError('Código de verificação inválido ou expirado.')
        }
        return reply.status(204).send(null)
      }
    )
}
