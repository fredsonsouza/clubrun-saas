import {
  requireActiveMembership,
  requireClubAbility,
} from '@/authorization/club-authorization'
import {
  PrivateWorkoutDto,
  PublicWorkoutDto,
  privateWorkoutSelect,
} from '@/http/dtos'
import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getWorkoutVisibilityFilter } from '@/utils/workout-visibility'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ResourceNotFoundError } from '../_errors/resource-not-found-error'

export async function getWorkout(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug/workouts/:workoutSlug',
      {
        schema: {
          tags: ['workouts'],
          summary: 'Get workout details',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            workoutSlug: z.string(),
          }),
          response: {
            200: z.object({
              workout: z.union([PrivateWorkoutDto, PublicWorkoutDto]),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug, workoutSlug } = request.params
        const context = await requireActiveMembership(request, slug)
        const { club, memberShip, userId } = context

        const visibilityFilter = getWorkoutVisibilityFilter(
          userId,
          memberShip.role,
          memberShip.isSystemAdmin
        )
        const where = {
          slug: workoutSlug,
          clubId: club.id,
          ...visibilityFilter,
        }

        const workoutAccess = await prisma.workout.findFirst({
          where,
          select: {
            id: true,
            athleteId: true,
            clubId: true,
            visibility: true,
          },
        })

        if (!workoutAccess) {
          throw new ResourceNotFoundError('Workout not found')
        }

        const workoutSubject = {
          __typename: 'Workout' as const,
          ...workoutAccess,
        }
        requireClubAbility(context, 'get', workoutSubject)
        const canViewPrivateDetails = context.ability.can(
          'view_private',
          workoutSubject
        )

        const workout = await prisma.workout.findFirst({
          where,
          select: {
            ...privateWorkoutSelect,
            notes: canViewPrivateDetails,
            targetDistance: canViewPrivateDetails,
            targetDuration: canViewPrivateDetails,
            routeData: canViewPrivateDetails,
          },
        })

        if (!workout) {
          throw new ResourceNotFoundError('Workout not found')
        }

        return reply.send({ workout })
      }
    )
}
