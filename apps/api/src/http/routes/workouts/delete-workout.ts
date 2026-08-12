import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { creditShoesOnce } from '@/services/shoes-mileage-ledger'
import {
  updateAthletePaceAverage,
  updateAthleteRanking,
} from '@/services/update-athlete-ranking'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { workoutSchema } from '@saas/auth'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { ForbiddenError } from '../_errors/forbidden-error'

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
          params: z.object({ workoutId: z.string(), slug: z.string() }),
          response: { 204: z.null() },
        },
      },
      async (request, reply) => {
        const { slug, workoutId } = request.params
        const userId = await request.getCurrentUserId()
        const { memberShip, club } = await request.getUserMemberShip(slug)
        const workout = await prisma.workout.findUnique({
          where: { id: workoutId, clubId: club.id },
        })
        if (!workout) throw new BadRequestError('Workout not found!')

        const { cannot } = getUserPermissions(
          userId,
          memberShip.role,
          memberShip.isSystemAdmin,
          memberShip.clubId ?? club.id,
          club.ownerId
        )
        if (cannot('delete', workoutSchema.parse(workout))) {
          throw new ForbiddenError(`You're not allowed to delete this workout`)
        }

        await prisma.$transaction(async (tx) => {
          if (workout.status === 'COMPLETED' && workout.shoesUsed) {
            await creditShoesOnce(tx, {
              athleteId: workout.athleteId,
              sourceType: 'WORKOUT',
              sourceId: workout.id,
              distanceKm: workout.distance,
            })
          }

          const deleted = await tx.workout.deleteMany({
            where: { id: workoutId, clubId: club.id, version: workout.version },
          })
          if (deleted.count !== 1) {
            throw new BadRequestError(
              'Treino foi alterado por outra requisição.'
            )
          }

          if (workout.status === 'COMPLETED') {
            await updateAthletePaceAverage(tx, workout.athleteId, club.id)
            await updateAthleteRanking(
              tx,
              workout.athleteId,
              club.id,
              workout.date
            )
          }
        })

        return reply.status(204).send(null)
      }
    )
}
