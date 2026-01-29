import { prisma } from '@/lib/prisma'
import { env } from '@saas/env'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

const googleTokenErrorSchema = z.object({
  error: z.string(),
  error_description: z.string().optional(),
})

export async function authenticateWithGoogle(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/google',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate with google account',
        body: z.object({
          code: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
          400: z.object({
            error: z.string(),
            error_description: z.string().optional(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { code } = request.body

      const body = new URLSearchParams({
        code,
        client_id: env.GOOGLE_OAUTH_CLIENT_ID,
        client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_OAUTH_CLIENT_REDIRECT_URI,
        grant_type: 'authorization_code',
      })

      const googleAccessTokenResponse = await fetch(
        'https://oauth2.googleapis.com/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body,
        }
      )

      const googleAccessTokenData = await googleAccessTokenResponse.json()

      if (!googleAccessTokenResponse.ok) {
        const parsedError = googleTokenErrorSchema.safeParse(
          googleAccessTokenData
        )

        return reply
          .status(400)
          .send(
            parsedError.success
              ? parsedError.data
              : { error: 'google_oauth_error' }
          )
      }

      const { access_token } = z
        .object({
          access_token: z.string(),
        })
        .parse(googleAccessTokenData)

      const googleUserResponse = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )

      const googleUserData = await googleUserResponse.json()

      const {
        sub: googleId,
        name,
        email,
        picture: avatarUrl,
      } = z
        .object({
          sub: z.string(),
          name: z.string(),
          email: z.email(),
          picture: z.url(),
        })
        .parse(googleUserData)

      let user = await prisma.user.findUnique({ where: { email } })

      if (!user) {
        user = await prisma.user.create({
          data: { name, email, avatarUrl },
        })
      }

      let account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: 'GOOGLE',
            providerAccountId: googleId,
          },
        },
      })

      if (!account) {
        await prisma.account.create({
          data: {
            provider: 'GOOGLE',
            providerAccountId: googleId,
            userId: user.id,
          },
        })
      }

      const token = await reply.jwtSign(
        { sub: user.id },
        { sign: { expiresIn: '7d' } }
      )

      return reply.status(201).send({ token })
    }
  )
}
