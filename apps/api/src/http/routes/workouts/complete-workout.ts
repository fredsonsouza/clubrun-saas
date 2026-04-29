import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { BadRequestError } from '../_errors/bad-request-error'

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
          params: z.object({
            slug: z.string(),
            workoutId: z.string().uuid(),
          }),
          body: z.object({
            distance: z.number().optional(), // In case they want to adjust
            duration: z.number(),
            notes: z.string().nullish(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, workoutId } = request.params
        const userId = await request.getCurrentUserId()
        const { club } = await request.getUserMemberShip(slug)

        const workout = await prisma.workout.findUnique({
          where: { id: workoutId },
        })

        if (!workout) {
          throw new BadRequestError('Workout not found')
        }

        if (workout.athleteId !== userId) {
          throw new UnauthorizedError('You can only complete your own workouts')
        }

        if (workout.status === 'COMPLETED') {
          throw new BadRequestError('Workout already completed')
        }

        const { distance, duration, notes } = request.body
        const finalDistance = distance || workout.distance
        const finalPace = (duration / 60) / finalDistance

        await prisma.workout.update({
          where: { id: workoutId },
          data: {
            distance: finalDistance,
            duration,
            pace: finalPace,
            notes: notes || workout.notes,
            status: 'COMPLETED',
            date: new Date(), // Set completion date to now or preserve planned date? User said "when member finishes". Usually now.
          },
        })

        // Update AthleteProfile and Ranking
        const { updateAthleteRanking } = await import('@/services/update-athlete-ranking')
        await updateAthleteRanking(userId, club.id, new Date())

        const athleteStats = await prisma.workout.aggregate({
          where: {
            athleteId: userId,
            clubId: club.id,
            status: 'COMPLETED',
          },
          _sum: {
            distance: true,
            duration: true,
          },
        })

        if (athleteStats._sum.distance && athleteStats._sum.duration) {
          const totalDistance = athleteStats._sum.distance
          const totalSeconds = athleteStats._sum.duration
          const newPaceAvg = (totalSeconds / 60) / totalDistance

          await prisma.athleteProfile.upsert({
            where: { userId },
            create: {
              userId,
              paceAvg: newPaceAvg,
            },
            update: {
              paceAvg: newPaceAvg,
            },
          })
        }

        return reply.status(204).send()
      }
    )
}
