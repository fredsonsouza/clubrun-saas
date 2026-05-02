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
                avatarUrl: z.string().nullable(),
                isSystemAdmin: z.boolean(),
              }),
              athleteProfile: z.object({
                bio: z.string().nullable().optional(),
                city: z.string().nullable().optional(),
                paceAvg: z.number().nullable().optional(),
                weight: z.number().nullable().optional(),
                height: z.number().nullable().optional(),
                gender: z.any().nullable().optional(),
                instagramUrl: z.string().nullable().optional(),
                stravaUrl: z.string().nullable().optional(),
              }).nullable(),
              workouts: z.array(z.any()),
              plannedWorkouts: z.array(z.any()),
            }),
          },
        },
      },
      async (request, reply) => {
        const { userId: profileUserId } = request.params
        const currentUserId = await request.getCurrentUserId()
        const isOwner = currentUserId === profileUserId
        
        console.log(`[DEBUG] Buscando perfil do usuário: ${profileUserId} (Solicitado por: ${currentUserId})`)

        const user = await prisma.user.findUnique({
          where: { id: profileUserId },
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            isSystemAdmin: true,
            athleteProfile: true,
          },
        })

        if (!user) {
          console.error(`[ERROR] Usuário não encontrado no banco: ${profileUserId}`)
          throw new BadRequestError('User not found')
        }

        const workouts = await prisma.workout.findMany({
          where: {
            athleteId: profileUserId,
            status: 'COMPLETED',
          },
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
        })

        const plannedWorkouts = isOwner ? await prisma.workout.findMany({
          where: {
            athleteId: profileUserId,
            status: 'PLANNED',
          },
          include: {
            club: {
              select: {
                name: true,
                slug: true,
              }
            }
          },
          orderBy: {
            date: 'asc',
          },
        }) : []

        return reply.send({
          user,
          athleteProfile: user.athleteProfile,
          workouts,
          plannedWorkouts,
        })
      }
    )
}
