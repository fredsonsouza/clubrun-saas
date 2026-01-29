import { fastify } from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastifyJwt from '@fastify/jwt'

import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createAccount } from './routes/auth/create-account'
import { authenticateWithPassword } from './routes/auth/authenticate-with-password'
import { getProfile } from './routes/auth/get-profile'
import { errorHandler } from './error-handle'
import { requestPasswordRecovery } from './routes/auth/request-password-recovery'
import { resetPassword } from './routes/auth/reset-password'
import { authenticateWithGoogle } from './routes/auth/authenticate-with-google'
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

const app = fastify().withTypeProvider<ZodTypeProvider>()

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

app.register(createAccount)
app.register(authenticateWithPassword)
app.register(getProfile)
app.register(requestPasswordRecovery)
app.register(resetPassword)
app.register(authenticateWithGoogle)

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

app.register(getMembers)
app.register(updateMember)
app.register(removeMember)

app.register(createInvite)
app.register(getInvite)
app.register(getInvites)
app.register(acceptInvite)
app.register(rejectInvite)
app.register(revokeInvite)
app.register(getPendingInvites)

app.register(getClubBilling)

app.listen({ port: env.SERVER_PORT }).then(() => {
  console.log('HTTP server runnig ✅')
})
