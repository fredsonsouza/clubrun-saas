import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { debitShoesOnce } from '@/services/shoes-mileage-ledger'
import {
  updateAthletePaceAverage,
  updateAthleteRanking,
} from '@/services/update-athlete-ranking'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { ForbiddenError } from '../_errors/forbidden-error'
import { ResourceNotFoundError } from '../_errors/resource-not-found-error'

export async function completeWorkout(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/clubs/:slug/workouts/:workoutId/complete',
      {
        schema: {
          tags: ['workouts'],
          summary: 'Complete a planned workout',
          security: [{ bearerAuth: [] }],
          params: z.object({ slug: z.string(), workoutId: z.string().uuid() }),
          body: z.object({
            distance: z.number().finite().positive().max(500).optional(),
            duration: z.number().finite().positive(),
            notes: z.string().nullish(),
            stravaActivityId: z.string().optional(),
            syncSource: z.string().optional(),
          }),
          response: { 204: z.null() },
        },
      },
      async (request, reply) => {
        const { slug, workoutId } = request.params
        const userId = await request.getCurrentUserId()
        const { club } = await request.getUserMemberShip(slug)
        const workout = await prisma.workout.findFirst({
          where: { id: workoutId, clubId: club.id },
        })

        if (!workout) throw new ResourceNotFoundError('Workout not found')
        if (workout.athleteId !== userId) {
          throw new ForbiddenError('You can only complete your own workouts')
        }

        const { distance, duration, notes, stravaActivityId, syncSource } =
          request.body
        const finalDistance = distance ?? workout.distance
        const completionDate = new Date()
        const finalPace = duration / 60 / finalDistance

        await prisma.$transaction(async (tx) => {
          const athleteProfile = await tx.athleteProfile.findUnique({
            where: { userId },
            select: { shoes: true, shoesRemainingDistance: true },
          })
          const shoesUsed = athleteProfile?.shoes ?? null

          const transitioned = await tx.workout.updateMany({
            where: {
              id: workoutId,
              clubId: club.id,
              athleteId: userId,
              status: 'PLANNED',
            },
            data: {
              distance: finalDistance,
              duration,
              pace: finalPace,
              notes: notes ?? workout.notes,
              status: 'COMPLETED',
              date: completionDate,
              stravaActivityId: stravaActivityId ?? null,
              syncSource: syncSource ?? 'MANUAL',
              targetDistance: workout.targetDistance ?? workout.distance,
              targetDuration: workout.targetDuration ?? workout.duration,
              shoesUsed,
              version: { increment: 1 },
            },
          })

          if (transitioned.count !== 1) {
            throw new BadRequestError('Workout already completed')
          }

          if (shoesUsed) {
            try {
              await debitShoesOnce(tx, {
                athleteId: userId,
                sourceType: 'WORKOUT',
                sourceId: workoutId,
                distanceKm: finalDistance,
              })
            } catch {
              throw new BadRequestError('Quilometragem de tênis insuficiente.')
            }
          }

          await updateAthleteRanking(tx, userId, club.id, completionDate)
          await updateAthletePaceAverage(tx, userId, club.id)
        })

        return reply.status(204).send(null)
      }
    )
}
