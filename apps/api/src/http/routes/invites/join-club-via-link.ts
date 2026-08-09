import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { requirePremiumEntitlement } from '@/utils/premium-entitlement'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

export async function joinClubViaLink(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/clubs/:slug/join',
      {
        schema: {
          tags: ['invites'],
          summary: 'Join a club using a shareable invite link',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          body: z.object({
            token: z.string(),
          }),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const { token } = request.body
        const userId = await request.getCurrentUserId()
        await requirePremiumEntitlement(userId)

        const club = await prisma.club.findUnique({
          where: { slug, inviteToken: token },
        })

        if (!club) {
          throw new BadRequestError('Invalid invite link or token.')
        }

        const existingMember = await prisma.member.findUnique({
          where: {
            clubId_userId: {
              clubId: club.id,
              userId,
            },
          },
        })

        if (existingMember) {
          throw new BadRequestError('You are already a member of this club.')
        }

        await prisma.member.create({
          data: {
            userId,
            clubId: club.id,
            role: 'ATHLETE',
            status: 'PENDING', // Requirement: Approval needed
          },
        })

        return reply.status(201).send(null)
      }
    )
}
