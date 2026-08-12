import {
  OwnAthleteDto,
  PublicAthleteDto,
  PublicWorkoutDto,
  ownAthleteSelect,
  publicAthleteSelect,
  publicWorkoutSelect,
} from '@/http/dtos'
import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { subDays } from 'date-fns'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ResourceNotFoundError } from '../_errors/resource-not-found-error'

type Reaction = { type: string; userId: string }
type OwnProfile = {
  weight: number | null
  height: number | null
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null
  birthDate: Date
  shoes: string | null
  shoesMaxDistance: number | null
  shoesRemainingDistance: number | null
  watch: string | null
}

function formatReactions<T extends { reactions: Reaction[] }>(
  workouts: T[],
  currentUserId: string
) {
  return workouts.map((workout) => {
    const reactionCounts: Record<string, number> = {}
    let currentUserReaction: string | null = null

    for (const reaction of workout.reactions) {
      reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1
      if (reaction.userId === currentUserId) {
        currentUserReaction = reaction.type
      }
    }

    const { reactions: _, ...safeWorkout } = workout
    return {
      ...safeWorkout,
      reactions: Object.entries(reactionCounts).map(([type, count]) => ({
        type,
        count,
      })),
      currentUserReaction,
    }
  })
}

export async function getUserProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/users/:userId/profile',
      {
        schema: {
          tags: ['users'],
          summary: 'Get the public-safe user profile by ID',
          security: [{ bearerAuth: [] }],
          params: z.object({ userId: z.uuid() }),
        },
      },
      async (request, reply) => {
        const { userId: profileUserId } = request.params
        const currentUserId = await request.getCurrentUserId()
        const isOwnProfile = currentUserId === profileUserId

        const user = isOwnProfile
          ? await prisma.user.findUnique({
              where: { id: profileUserId },
              select: ownAthleteSelect,
            })
          : await prisma.user.findUnique({
              where: { id: profileUserId },
              select: publicAthleteSelect,
            })

        if (!user || (!isOwnProfile && !user.athleteProfile?.isPublic)) {
          throw new ResourceNotFoundError('Athlete profile not found')
        }

        const ownProfile = user.athleteProfile as OwnProfile | null
        const baseProfile = user.athleteProfile
          ? {
              isPublic: user.athleteProfile.isPublic,
              bio: user.athleteProfile.bio ?? null,
              city: user.athleteProfile.city ?? null,
              paceAvg: user.athleteProfile.paceAvg ?? null,
              instagramUrl: user.athleteProfile.instagramUrl ?? null,
              youtubeUrl: user.athleteProfile.youtubeUrl ?? null,
              stravaUrl: user.athleteProfile.stravaUrl ?? null,
              coverUrl: user.athleteProfile.coverUrl ?? null,
              isPremium: user.athleteProfile.isPremium,
              isStravaConnected: Boolean(user.athleteProfile.stravaAthleteId),
            }
          : null

        const athlete = isOwnProfile
          ? OwnAthleteDto.parse({
              user: {
                id: user.id,
                name: user.name,
                avatarUrl: user.avatarUrl,
              },
              athleteProfile:
                baseProfile && ownProfile
                  ? {
                      ...baseProfile,
                      weight: ownProfile.weight,
                      height: ownProfile.height,
                      gender: ownProfile.gender,
                      birthDate: ownProfile.birthDate,
                      shoes: ownProfile.shoes,
                      shoesMaxDistance: ownProfile.shoesMaxDistance,
                      shoesRemainingDistance: ownProfile.shoesRemainingDistance,
                      watch: ownProfile.watch,
                    }
                  : null,
            })
          : PublicAthleteDto.parse({
              user: {
                id: user.id,
                name: user.name,
                avatarUrl: user.avatarUrl,
              },
              athleteProfile: baseProfile,
            })

        const workoutVisibility = isOwnProfile
          ? {}
          : { visibility: 'PUBLIC' as const }
        const workoutsStats = await prisma.workout.aggregate({
          where: {
            athleteId: profileUserId,
            status: 'COMPLETED',
            ...workoutVisibility,
            date: { gte: subDays(new Date(), 30) },
          },
          _sum: { distance: true, duration: true },
          _count: { id: true },
        })

        const [workouts, plannedWorkouts] = await Promise.all([
          prisma.workout.findMany({
            where: {
              athleteId: profileUserId,
              status: 'COMPLETED',
              ...workoutVisibility,
            },
            select: publicWorkoutSelect,
            orderBy: { date: 'desc' },
            take: 20,
          }),
          isOwnProfile
            ? prisma.workout.findMany({
                where: {
                  athleteId: profileUserId,
                  status: 'PLANNED',
                },
                select: publicWorkoutSelect,
                orderBy: { date: 'asc' },
              })
            : Promise.resolve([]),
        ])

        const totalDistance = workoutsStats._sum.distance || 0
        const totalDuration = workoutsStats._sum.duration || 0

        const responsePayload = {
          ...athlete,
          stats: {
            avgPace: totalDistance > 0 ? totalDuration / 60 / totalDistance : 0,
            totalDistance,
            totalWorkouts: workoutsStats._count.id || 0,
          },
          workouts: formatReactions(workouts, currentUserId),
          plannedWorkouts: formatReactions(plannedWorkouts, currentUserId),
        }
        return reply.send(responsePayload)
      }
    )
}
