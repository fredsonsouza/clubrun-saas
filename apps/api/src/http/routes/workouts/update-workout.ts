import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { workoutSchema } from '@saas/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { auth } from '@/http/middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'

export async function updateWorkout(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/clubs/:slug/workouts/:workoutId',
      {
        schema: {
          tags: ['workouts'],
          summary: 'Update a workout',
          security: [{ bearerAuth: [] }],
          body: z.object({
            title: z.string().nullable(),
            distance: z.number(),
            duration: z.number().int().nullable(),
            pace: z.number().nullable(),
            type: z.string(),
          }),
          params: z.object({
            slug: z.string(),
            workoutId: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, workoutId } = request.params
        const userId = await request.getCurrentUserId()
        const { memberShip, club } = await request.getUserMemberShip(slug)

        const workout = await prisma.workout.findUnique({
          where: {
            id: workoutId,
            clubId: club.id,
          },
        })

        if (!workout) {
          throw new BadRequestError('Workout not found!')
        }

        const authWorkout = workoutSchema.parse(workout)

        const { cannot } = getUserPermissions(userId, memberShip.role)

        if (cannot('update', authWorkout)) {
          throw new UnauthorizedError(
            `You're not allowed to update this workout`
          )
        }

        const { title, distance, duration, pace, type } = request.body

        await prisma.workout.update({
          where: {
            id: workoutId,
          },
          data: {
            title,
            distance,
            duration,
            pace,
            type,
          },
        })

        return reply.status(204).send()
      }
    )
}
