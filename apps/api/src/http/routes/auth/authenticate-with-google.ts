import { prisma } from '@/lib/prisma'
import { authRateLimit } from '@/utils/auth-rate-limit'
import { createAuditLog } from '@/utils/audit-log'
import { normalizeEmail } from '@/utils/identity'
import { issueAccessToken } from '@/utils/jwt'
import { consumeOAuthAttemptInTransaction } from '@/utils/oauth'
import { sha256 } from '@/utils/tokens'
import { env } from '@saas/env'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

const googleTokenErrorSchema = z.object({
  error: z.string(),
  error_description: z.string().optional(),
})

const googleUserSchema = z.object({
  sub: z.string(),
  name: z.string(),
  email: z.email(),
  email_verified: z.literal(true),
  picture: z.url().optional(),
})

export async function authenticateWithGoogle(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/google',
    {
      config: authRateLimit((request) => {
        const body = (request.body ?? {}) as { state?: string }
        return sha256(body.state ?? '')
      }),
      schema: {
        tags: ['auth'],
        summary: 'Authenticate with google account',
        body: z.object({
          code: z.string().min(1),
          state: z.string().min(32).max(256),
          codeVerifier: z.string().regex(/^[A-Za-z0-9._~-]{43,128}$/),
        }),
        response: {
          201: z.object({ token: z.string() }),
          400: z.object({
            error: z.string(),
            error_description: z.string().optional(),
          }),
          409: z.object({ error: z.literal('linking_required') }),
        },
      },
    },
    async (request, reply) => {
      const { code, state, codeVerifier } = request.body
      const validAttempt = await prisma.$transaction((tx) =>
        consumeOAuthAttemptInTransaction(tx, state, codeVerifier)
      )
      if (!validAttempt) {
        return reply.status(400).send({ error: 'invalid_oauth_attempt' })
      }

      const tokenRequestBody = new URLSearchParams({
        code,
        code_verifier: codeVerifier,
        client_id: env.GOOGLE_OAUTH_CLIENT_ID,
        client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_OAUTH_CLIENT_REDIRECT_URI,
        grant_type: 'authorization_code',
      })
      const googleAccessTokenResponse = await fetch(
        'https://oauth2.googleapis.com/token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: tokenRequestBody,
        }
      )
      const googleAccessTokenData = await googleAccessTokenResponse.json()
      if (!googleAccessTokenResponse.ok) {
        const parsed = googleTokenErrorSchema.safeParse(googleAccessTokenData)
        return reply
          .status(400)
          .send(parsed.success ? parsed.data : { error: 'google_oauth_error' })
      }

      const accessToken = z
        .object({ access_token: z.string() })
        .safeParse(googleAccessTokenData)
      if (!accessToken.success) {
        return reply.status(400).send({ error: 'google_oauth_error' })
      }

      const googleUserResponse = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${accessToken.data.access_token}` } }
      )
      if (!googleUserResponse.ok) {
        return reply.status(400).send({ error: 'google_oauth_error' })
      }
      const googleUser = googleUserSchema.safeParse(
        await googleUserResponse.json()
      )
      if (!googleUser.success) {
        return reply.status(400).send({ error: 'google_email_unverified' })
      }

      const {
        sub: googleId,
        name,
        picture: avatarUrl,
      } = googleUser.data
      const email = normalizeEmail(googleUser.data.email)

      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: 'GOOGLE',
            providerAccountId: googleId,
          },
        },
        select: {
          user: { select: { id: true, sessionVersion: true } },
        },
      })

      let user: { id: string; sessionVersion: number }
      if (account) {
        user = account.user
        createAuditLog({
          userId: user.id,
          action: 'GOOGLE_LOGIN',
          entity: 'USER',
          entityId: user.id,
          payload: { method: 'google' },
        })
      } else {
        const existingUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        })
        if (existingUser) {
          return reply.status(409).send({ error: 'linking_required' })
        }

        user = await prisma.$transaction(async (tx) => {
          const created = await tx.user.create({
            data: {
              name,
              email,
              avatarUrl,
              emailVerifiedAt: new Date(),
              athleteProfile: {
                create: {
                  isPublic: true,
                  birthDate: new Date('2000-01-01'),
                },
              },
              accounts: {
                create: {
                  provider: 'GOOGLE',
                  providerAccountId: googleId,
                },
              },
            },
            select: { id: true, sessionVersion: true },
          })
          return created
        })
        createAuditLog({
          userId: user.id,
          action: 'GOOGLE_SIGNUP',
          entity: 'USER',
          entityId: user.id,
          payload: { method: 'google' },
        })
      }

      return reply.status(201).send({ token: await issueAccessToken(reply, user) })
    }
  )
}
