import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { auth } from '@/http/middlewares/auth'

export function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/profile',
      {
        schema: {
          tags: ['auth'],
          summary: 'Get Authenticated user profile',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              user: z.object({
                id: z.uuid(),
                name: z.string().nullable(),
                email: z.string().email(),
                avatarUrl: z.string().nullable(),
                isSystemAdmin: z.boolean(),
                emailVerifiedAt: z.date().nullable(),
                hasPassword: z.boolean(),
                isPremium: z.boolean(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const user = await prisma.user.findUnique({
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            isSystemAdmin: true,
            emailVerifiedAt: true,
            passwordHash: true,
            clubsOwned: { select: { id: true } },
            members_on: { select: { role: true } },
            athleteProfile: {
              select: {
                isPremium: true
              }
            }
          },
          where: {
            id: userId,
          },
        })
        if (!user) {
          throw new BadRequestError('User not found!')
        }

        const isClubAdmin = user.clubsOwned.length > 0 || user.members_on.some(m => ['OWNER', 'COACH', 'MANAGER', 'ADMIN'].includes(m.role))
        const isPremium = isClubAdmin || user.isSystemAdmin || user.athleteProfile?.isPremium || false

        return reply.send({ 
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            isSystemAdmin: user.isSystemAdmin,
            emailVerifiedAt: user.emailVerifiedAt,
            hasPassword: !!user.passwordHash,
            isPremium
          }
        })
      }
    )
}
