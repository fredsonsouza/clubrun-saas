import 'dotenv/config'

import { mkdirSync } from 'node:fs'
import path from 'node:path'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyStatic from '@fastify/static'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { fastify } from 'fastify'

import {
  type ZodTypeProvider,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import { subscribeAthlete } from './routes/athlete/subscribe-athlete'
import { updateAthleteProfile } from './routes/athlete/update-athlete-profile'
import { authenticateWithGoogle } from './routes/auth/authenticate-with-google'
import { authenticateWithPassword } from './routes/auth/authenticate-with-password'
import { createAccount } from './routes/auth/create-account'
import { getProfile } from './routes/auth/get-profile'
import { requestPasswordRecovery } from './routes/auth/request-password-recovery'
import { resendVerification } from './routes/auth/resend-verification'
import { resetPassword } from './routes/auth/reset-password'
import { verifyEmail } from './routes/auth/verify-email'
import { getClubBilling } from './routes/billing/get-club-billing'
import { payInvoice } from './routes/billing/pay-invoice'
import { createClub } from './routes/clubs/create-club'
import { getClub } from './routes/clubs/get-club'
import { getClubDashBoard } from './routes/clubs/get-club-dashboard'
import { getClubs } from './routes/clubs/get-clubs'
import { getMemberShip } from './routes/clubs/get-membership'
import { shutdownClub } from './routes/clubs/shutdown-club'
import { transferClub } from './routes/clubs/transfer-club'
import { updateClub } from './routes/clubs/update-club'
import { acceptInvite } from './routes/invites/accept-invite'
import { approveInvite } from './routes/invites/approve-invite'
import { createInvite } from './routes/invites/create-invite'
import { getInvite } from './routes/invites/get-invite'
import { getInvites } from './routes/invites/get-invites'
import { getPendingInvites } from './routes/invites/get-pending-invites'
import { rejectInvite } from './routes/invites/reject-invite'
import { revokeInvite } from './routes/invites/revoke-invite'
import { getMembers } from './routes/members/get-members'
import { removeMember } from './routes/members/remove-member'
import { updateMember } from './routes/members/update-member'
import { createRace } from './routes/races/create-race'
import { createRaceResult } from './routes/races/create-race-result'
import { deleteRace } from './routes/races/delete-race'
import { getRace } from './routes/races/get-race'
import { getRaceParticipants } from './routes/races/get-race-participants'
import { getRaceResults } from './routes/races/get-race-results'
import { getRaces } from './routes/races/get-races'
import { toggleRaceRegistration } from './routes/races/toggle-race-registration'
import { updateRace } from './routes/races/update-race'
import { updateRacePaymentStatus } from './routes/races/update-race-payment-status'
import { getClubeRanking } from './routes/rankings/get-club-ranking'
import { createFeedback } from './routes/system/create-feedback'
import { createWaitlist } from './routes/system/create-waitlist'
import { getSystemBilling } from './routes/system/get-system-billing'
import { getSystemClubs } from './routes/system/get-system-clubs'
import { getSystemFeedbacks } from './routes/system/get-system-feedbacks'
import { getSystemLogs } from './routes/system/get-system-logs'
import { getSystemStats } from './routes/system/get-system-stats'
import { getSystemWaitlist } from './routes/system/get-system-waitlist'
import { uploadImage } from './routes/uploads/upload-image'
import { anonymizeUser } from './routes/users/anonymize-user'
import { connectStrava } from './routes/users/connect-strava'
import { disconnectStrava } from './routes/users/disconnect-strava'
import { getUserProfile } from './routes/users/get-user-profile'
import { updatePassword } from './routes/users/update-password'
import { createWorkout } from './routes/workouts/create-workout'
import { deleteWorkout } from './routes/workouts/delete-workout'
import { getMyWorkouts } from './routes/workouts/get-my-workouts'
import { getWorkout } from './routes/workouts/get-workout'
import { getWorkouts } from './routes/workouts/get-workouts'
import { updateWorkout } from './routes/workouts/update-workout'

import { env } from '@saas/env'
import { errorHandler } from './error-handle'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'ClubRun SaaS',
      description: 'Full-stack SaaS app with multi-tenant & RBAC',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifyCors)

import fastifyRateLimit from '@fastify/rate-limit'

app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute',
})

const uploadDir = path.resolve(__dirname, '../../uploads')
mkdirSync(uploadDir, { recursive: true })

app.register(fastifyStatic, {
  root: uploadDir,
  prefix: '/uploads',
})

import { completeWorkout } from './routes/workouts/complete-workout'
import { toggleWorkoutReaction } from './routes/workouts/toggle-workout-reaction'

app.register(createAccount)
app.register(authenticateWithPassword)
app.register(getProfile)
app.register(updateAthleteProfile)
app.register(subscribeAthlete)
app.register(requestPasswordRecovery)
app.register(resetPassword)
app.register(authenticateWithGoogle)
app.register(verifyEmail)
app.register(resendVerification)

app.register(createClub)
app.register(getMemberShip)
app.register(getClub)
app.register(getClubs)
app.register(updateClub)
app.register(shutdownClub)
app.register(transferClub)

app.register(createWorkout)
app.register(deleteWorkout)
app.register(getWorkout)
app.register(getWorkouts)
app.register(updateWorkout)
app.register(getMyWorkouts)
app.register(completeWorkout)
app.register(toggleWorkoutReaction)

import { getPendingMembers } from './routes/members/get-pending-members'
import { requestJoinClub } from './routes/members/request-join-club'
import { updateMemberStatus } from './routes/members/update-member-status'

app.register(getMembers)
app.register(getPendingMembers)
app.register(updateMember)
app.register(updateMemberStatus)
app.register(requestJoinClub)
app.register(removeMember)

import { getClubInviteLink } from './routes/invites/get-club-invite-link'
import { joinClubViaLink } from './routes/invites/join-club-via-link'

app.register(createInvite)
app.register(getInvite)
app.register(getInvites)
app.register(getClubInviteLink)
app.register(joinClubViaLink)
app.register(acceptInvite)
app.register(approveInvite)
app.register(rejectInvite)
app.register(revokeInvite)
app.register(getPendingInvites)

import { activateBilling } from './routes/billing/activate-billing'

app.register(getClubBilling)
app.register(activateBilling)
app.register(payInvoice)

import { getExploreClubs } from './routes/clubs/get-explore-clubs'

import { getClubPublicInfo } from './routes/clubs/get-club-public-info'

app.register(getClubeRanking)
app.register(getClubDashBoard)
app.register(getExploreClubs)
app.register(getClubPublicInfo)

app.register(createRace)
app.register(getRaces)
app.register(getRace)
app.register(updateRace)
app.register(deleteRace)
app.register(toggleRaceRegistration)
app.register(getRaceParticipants)
app.register(updateRacePaymentStatus)
app.register(createRaceResult)
app.register(getRaceResults)
app.register(getSystemStats)
app.register(getSystemClubs)
app.register(getSystemLogs)
app.register(getSystemBilling)
app.register(createWaitlist)
app.register(createFeedback)
app.register(getSystemFeedbacks)
app.register(getSystemWaitlist)
app.register(getUserProfile)
app.register(uploadImage)
app.register(anonymizeUser)
app.register(updatePassword)
app.register(connectStrava)
app.register(disconnectStrava)

// app.listen({ port: env.SERVER_PORT }).then(() => {
//   console.log('HTTP server runnig ✅')
// })

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT ? Number(process.env.PORT) : 3333
  app.listen({ port, host: '0.0.0.0' }).then(() => {
    console.log(`HTTP server running on port ${port}! ✅`)
  })
}
