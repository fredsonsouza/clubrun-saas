'use server'

import { clearInviteContinuation, getInviteContinuation } from '@/auth/cookies'
import { acceptInvite } from '@/http/accept-invite'
import { getClubRanking } from '@/http/get-club-ranking'
import { getClubs } from '@/http/get-clubs'
import { getInviteLink } from '@/http/get-invite-link'
import { getProfile } from '@/http/get-profile'
import { getRace } from '@/http/get-race'
import { getSystemLogs } from '@/http/get-system-logs'
import { getUserProfile } from '@/http/get-user-profile'
import { getWorkouts } from '@/http/get-workouts'
import { joinClub } from '@/http/join-club'
import { setRaceRegistration } from '@/http/race-registration'
import { requestJoinClub } from '@/http/request-join-club'
import { subscribeAthlete } from '@/http/subscribe-athlete'
import {
  getSystemFeedbacks,
  getSystemWaitlist,
  joinWaitlist,
  submitFeedback,
} from '@/http/waitlist-actions'
import { z } from 'zod'

const slugSchema = z.string().min(1).max(128)
const idSchema = z.string().min(1).max(256)

const workoutsSchema = z.object({
  slug: slugSchema,
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  status: z.enum(['PLANNED', 'COMPLETED']).optional(),
  athleteId: idSchema.optional(),
})

const rankingSchema = z.object({
  slug: slugSchema,
  type: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  year: z.number().int().optional(),
  month: z.number().int().min(1).max(12).optional(),
  week: z.number().int().min(1).max(53).optional(),
})

const paginationSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
})

const systemLogsSchema = paginationSchema.extend({
  action: z.string().max(128).optional(),
  entity: z.string().max(128).optional(),
  search: z.string().max(256).optional(),
  startDate: z.string().max(64).optional(),
  endDate: z.string().max(64).optional(),
})

export async function getClubsAction() {
  return getClubs()
}

export async function getWorkoutsAction(input: z.input<typeof workoutsSchema>) {
  return getWorkouts(workoutsSchema.parse(input))
}

export async function requestJoinClubAction(slug: string) {
  return requestJoinClub(slugSchema.parse(slug))
}

export async function getInviteLinkAction(slug: string) {
  return getInviteLink(slugSchema.parse(slug))
}

export async function getClubRankingAction(
  input: z.input<typeof rankingSchema>
) {
  return getClubRanking(rankingSchema.parse(input))
}

export async function getRaceAction(input: { slug: string; raceId: string }) {
  const parsed = z.object({ slug: slugSchema, raceId: idSchema }).parse(input)
  return getRace(parsed.slug, parsed.raceId)
}

export async function getCurrentAthleteProfileAction() {
  const { user } = await getProfile()
  const userId = idSchema.parse(user.id)
  const profile = await getUserProfile(userId)
  return profile.athleteProfile
}

export async function setRaceRegistrationAction(input: {
  slug: string
  raceId: string
  isRegistered: boolean
}) {
  const parsed = z
    .object({
      slug: slugSchema,
      raceId: idSchema,
      isRegistered: z.boolean(),
    })
    .parse(input)
  return setRaceRegistration(parsed)
}

export async function subscribeAthleteAction() {
  return subscribeAthlete()
}

export async function joinWaitlistAction(input: {
  email: string
  name?: string
}) {
  return joinWaitlist(
    z
      .object({
        email: z.email(),
        name: z.string().max(256).optional(),
      })
      .parse(input)
  )
}

export async function submitFeedbackAction(input: {
  type: 'BUG' | 'SUGGESTION' | 'OTHER'
  comment: string
}) {
  return submitFeedback(
    z
      .object({
        type: z.enum(['BUG', 'SUGGESTION', 'OTHER']),
        comment: z.string().min(1).max(5000),
      })
      .parse(input)
  )
}

export async function getSystemLogsAction(
  input: z.input<typeof systemLogsSchema> = {}
) {
  return getSystemLogs(systemLogsSchema.parse(input))
}

export async function getSystemFeedbacksAction(
  input: z.input<typeof paginationSchema> = {}
) {
  return getSystemFeedbacks(paginationSchema.parse(input))
}

export async function getSystemWaitlistAction(
  input: z.input<typeof paginationSchema> = {}
) {
  return getSystemWaitlist(paginationSchema.parse(input))
}

export async function acceptInviteAction(inviteId: string) {
  await acceptInvite(idSchema.parse(inviteId))
  await clearInviteContinuation()
}

export async function joinClubFromInviteAction(slug: string) {
  const continuation = await getInviteContinuation()
  if (!continuation?.token) {
    throw new Error('Convite inválido ou expirado.')
  }

  await joinClub(slugSchema.parse(slug), continuation.token)
  await clearInviteContinuation()
}
