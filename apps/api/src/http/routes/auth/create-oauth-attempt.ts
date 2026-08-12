import { prisma } from '@/lib/prisma'
import { authRateLimit } from '@/utils/auth-rate-limit'
import { OAUTH_ATTEMPT_TTL_MS } from '@/utils/oauth'
import { sha256 } from '@/utils/tokens'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function createOAuthAttempt(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/oauth/attempts',
    {
      config: authRateLimit((request) => {
        const body = (request.body ?? {}) as { state?: string }
        return sha256(body.state ?? '')
      }, 10),
      schema: {
        tags: ['auth'],
        summary: 'Register a one-time OAuth state and PKCE challenge',
        body: z.object({
          state: z.string().min(32).max(256),
          pkceChallenge: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
        }),
        response: { 201: z.null() },
      },
    },
    async (request, reply) => {
      const now = new Date()
      await prisma.oAuthAttempt.create({
        data: {
          stateDigest: sha256(request.body.state),
          pkceChallenge: request.body.pkceChallenge,
          expiresAt: new Date(now.getTime() + OAUTH_ATTEMPT_TTL_MS),
        },
      })
      return reply.status(201).send(null)
    }
  )
}
