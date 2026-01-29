import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { workoutSchema } from '@saas/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { auth } from '@/http/middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'

export async function deleteWorkout(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/clubs/:slug/workouts/workoutId',
      {
        schema: {
          tags: ['workouts'],
          summary: 'Delete a workout',
          security: [{ bearerAuth: [] }],
          params: z.object({
            workoutId: z.string(),
            slug: z.string(),
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

        if (cannot('delete', authWorkout)) {
          throw new UnauthorizedError(
            `You're not allowed to delete this workout`
          )
        }

        await prisma.club.delete({
          where: {
            id: workout.id,
          },
        })

        return reply.status(204).send()
      }
    )
}
