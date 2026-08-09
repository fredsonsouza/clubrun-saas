import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { requirePremiumEntitlement } from '@/utils/premium-entitlement'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

export async function requestJoinClub(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/clubs/:slug/join-request',
      {
        schema: {
          tags: ['members'],
          summary: 'Request to join a club',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        await requirePremiumEntitlement(userId)

        const club = await prisma.club.findUnique({
          where: { slug },
        })

        if (!club) {
          throw new BadRequestError('Club not found.')
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
          throw new BadRequestError(
            'You are already a member or have a pending request.'
          )
        }

        await prisma.member.create({
          data: {
            clubId: club.id,
            userId,
            role: 'ATHLETE',
            status: 'PENDING',
          },
        })

        return reply.status(201).send(null)
      }
    )
}
