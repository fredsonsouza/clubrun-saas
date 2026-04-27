import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

export async function getUserProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/users/:userId/profile',
      {
        schema: {
          tags: ['users'],
          summary: 'Get user profile by ID',
          security: [{ bearerAuth: [] }],
          params: z.object({
            userId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              user: z.object({
                id: z.string().uuid(),
                name: z.string().nullable(),
                email: z.string(),
                avatarUrl: z.string().url().nullable(),
                isSystemAdmin: z.boolean(),
              }),
              athleteProfile: z.object({
                bio: z.string().nullable(),
                city: z.string().nullable(),
                paceAvg: z.number().nullable(),
                weight: z.number().nullable(),
                height: z.number().nullable(),
                gender: z.string().nullable(),
                instagramUrl: z.string().nullable(),
                stravaUrl: z.string().nullable(),
              }).nullable(),
              workouts: z.array(z.object({
                id: z.string().uuid(),
                title: z.string().nullable(),
                distance: z.number(),
                duration: z.number().nullable(),
                type: z.string(),
                date: z.date(),
                visibility: z.string(),
                club: z.object({
                  name: z.string(),
                  slug: z.string(),
                })
              })),
            }),
          },
        },
      },
      async (request, reply) => {
        const { userId } = request.params

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            isSystemAdmin: true,
            athleteProfile: true,
            workouts: {
              include: {
                club: {
                  select: {
                    name: true,
                    slug: true,
                  }
                }
              },
              orderBy: {
                date: 'desc',
              },
              take: 20,
            }
          },
        })

        if (!user) {
          throw new BadRequestError('User not found')
        }

        const { athleteProfile, workouts, ...userData } = user

        return reply.send({
          user: userData,
          athleteProfile,
          workouts,
        })
      }
    )
}
