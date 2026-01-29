import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z, { uuid } from 'zod'
import { createSlug } from '@/utils/create-slug'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { BadRequestError } from '../_errors/bad-request-error'

export async function getWorkout(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:clubSlug/:workouts/workoutSlug',
      {
        schema: {
          tags: ['workouts'],
          summary: 'Get workout details',
          security: [{ bearerAuth: [] }],
          params: z.object({
            clubSlug: z.string(),
            workoutSlug: z.string(),
          }),
          response: {
            200: z.object({
              workout: z.object({
                title: z.string().nullable(),
                distance: z.number(),
                duration: z.number().int().nullable(),
                pace: z.number().nullable(),
                type: z.string(),
                date: z.coerce.date(),
                notes: z.string().nullable(),
                imageUrl: z.string().nullable(),
                clubId: z.uuid(),
                athlete: z.object({
                  id: z.uuid(),
                  name: z.string().nullable(),
                  avatarUrl: z.string().nullable(),
                }),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { clubSlug, workoutSlug } = request.params
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(clubSlug)

        const { cannot } = getUserPermissions(userId, memberShip.role)

        if (cannot('get', 'Workout')) {
          throw new UnauthorizedError(`You're not allowed to see this workout`)
        }

        const workout = await prisma.workout.findUnique({
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
            clubId: true,
            distance: true,
            duration: true,
            pace: true,
            type: true,
            date: true,
            notes: true,
            athlete: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          where: {
            slug: workoutSlug,
            clubId: club.id,
          },
        })

        if (!workout) {
          throw new BadRequestError('Workout not found!')
        }
        return reply.send({ workout })
      }
    )
}
