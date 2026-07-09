import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { workoutSchema } from '@saas/auth'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function deleteWorkout(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/clubs/:slug/workouts/:workoutId',
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

        const { cannot } = getUserPermissions(
          userId,
          memberShip.role,
          memberShip.isSystemAdmin,
          memberShip.clubId
        )

        if (cannot('delete', authWorkout)) {
          throw new UnauthorizedError(
            `You're not allowed to delete this workout`
          )
        }

        if (workout.status === 'COMPLETED' && workout.shoesUsed) {
          const athleteProfile = await prisma.athleteProfile.findUnique({
            where: { userId: workout.athleteId },
            select: {
              shoes: true,
              shoesRemainingDistance: true,
            },
          })

          if (
            athleteProfile &&
            athleteProfile.shoes === workout.shoesUsed &&
            athleteProfile.shoesRemainingDistance !== null
          ) {
            await prisma.athleteProfile.update({
              where: { userId: workout.athleteId },
              data: {
                shoesRemainingDistance: {
                  increment: workout.distance,
                },
              },
            })
          }
        }

        await prisma.workout.delete({
          where: {
            id: workoutId,
          },
        })

        return reply.status(204).send()
      }
    )
}
