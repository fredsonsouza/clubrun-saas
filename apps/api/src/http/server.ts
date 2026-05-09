import { fastify } from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastifyJwt from '@fastify/jwt'
import fastifyStatic from '@fastify/static'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createAccount } from './routes/auth/create-account'
import { authenticateWithPassword } from './routes/auth/authenticate-with-password'
import { getProfile } from './routes/auth/get-profile'
import { updateAthleteProfile } from './routes/athlete/update-athlete-profile'
import { errorHandler } from './error-handle'
import { requestPasswordRecovery } from './routes/auth/request-password-recovery'
import { resetPassword } from './routes/auth/reset-password'
import { authenticateWithGoogle } from './routes/auth/authenticate-with-google'
import { verifyEmail } from './routes/auth/verify-email'
import { resendVerification } from './routes/auth/resend-verification'
import { env } from '@saas/env'
import { createClub } from './routes/clubs/create-club'
import { getMemberShip } from './routes/clubs/get-membership'
import { getClub } from './routes/clubs/get-club'
import { getClubs } from './routes/clubs/get-clubs'
import { updateClub } from './routes/clubs/update-club'
import { shutdownClub } from './routes/clubs/shutdown-club'
import { transferClub } from './routes/clubs/transfer-club'
import { createWorkout } from './routes/workouts/create-workout'
import { deleteWorkout } from './routes/workouts/delete-workout'
import { getWorkout } from './routes/workouts/get-workout'
import { getWorkouts } from './routes/workouts/get-workouts'
import { updateWorkout } from './routes/workouts/update-workout'
import { getMembers } from './routes/members/get-members'
import { updateMember } from './routes/members/update-member'
import { removeMember } from './routes/members/remove-member'
import { createInvite } from './routes/invites/create-invite'
import { getInvite } from './routes/invites/get-invite'
import { getInvites } from './routes/invites/get-invites'
import { acceptInvite } from './routes/invites/accept-invite'
import { rejectInvite } from './routes/invites/reject-invite'
import { revokeInvite } from './routes/invites/revoke-invite'
import { getPendingInvites } from './routes/invites/get-pending-invites'
import { getClubBilling } from './routes/billing/get-club-billing'
import { getMyWorkouts } from './routes/workouts/get-my-workouts'
import { payInvoice } from './routes/billing/pay-invoice'
import { getClubeRanking } from './routes/rankings/get-club-ranking'
import { createRace } from './routes/races/create-race'
import { getRaces } from './routes/races/get-races'
import { getRace } from './routes/races/get-race'
import { createRaceResult } from './routes/races/create-race-result'
import { getRaceResults } from './routes/races/get-race-results'
import { approveInvite } from './routes/invites/approve-invite'
import { getClubDashBoard } from './routes/clubs/get-club-dashboard'
import { getSystemStats } from './routes/system/get-system-stats'
import { getSystemClubs } from './routes/system/get-system-clubs'
import { getSystemLogs } from './routes/system/get-system-logs'
import { getSystemBilling } from './routes/system/get-system-billing'
import { getUserProfile } from './routes/users/get-user-profile'
import { uploadImage } from './routes/uploads/upload-image'

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

app.register(fastifyStatic, {
  root: path.resolve(__dirname, '../../uploads'),
  prefix: '/uploads',
})

import { completeWorkout } from './routes/workouts/complete-workout'

app.register(createAccount)
app.register(authenticateWithPassword)
app.register(getProfile)
app.register(updateAthleteProfile)
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

import { getPendingMembers } from './routes/members/get-pending-members'
import { updateMemberStatus } from './routes/members/update-member-status'
import { requestJoinClub } from './routes/members/request-join-club'

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
app.register(createRaceResult)
app.register(getRaceResults)
app.register(getSystemStats)
app.register(getSystemClubs)
app.register(getSystemLogs)
app.register(getSystemBilling)
app.register(getUserProfile)
app.register(uploadImage)

// app.listen({ port: env.SERVER_PORT }).then(() => {
//   console.log('HTTP server runnig ✅')
// })

if (process.env.NODE_ENV !== 'test') {
  app.listen({ port: 3333 }).then(() => {
    console.log('HTTP server running!✅')
  })
}
