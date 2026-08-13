import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

const isProduction = process.env.NODE_ENV === 'production'
const requiredProductionUrl = z
  .string()
  .url()
  .refine(
    (value) => !isProduction || !value.includes('localhost'),
    'localhost URLs are not allowed in production'
  )

const requiredProductionSecret = z
  .string()
  .refine(
    (value) => !isProduction || Buffer.byteLength(value, 'utf8') >= 32,
    'secret must be at least 32 bytes in production'
  )

export const env = createEnv({
  server: {
    SERVER_PORT: z.coerce.number().default(3333),
    DATABASE_URL: z.url(),

    JWT_SECRET: requiredProductionSecret.refine(
      (value) => Buffer.byteLength(value, 'utf8') >= 32,
      'JWT_SECRET must be at least 32 bytes'
    ),
    JWT_ISSUER: z.string().default('club-run-api'),
    JWT_AUDIENCE: z.string().default('club-run-clients'),
    TOKEN_PEPPER: z
      .string()
      .refine((value) => Buffer.byteLength(value, 'utf8') >= 32, {
        message: 'TOKEN_PEPPER must be at least 32 bytes',
      }),

    GOOGLE_OAUTH_CLIENT_ID: z.string(),
    GOOGLE_OAUTH_CLIENT_SECRET: z.string(),
    GOOGLE_OAUTH_CLIENT_REDIRECT_URI: requiredProductionUrl,
    RESEND_API_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: z.string(),
  },
  shared: {
    NEXT_PUBLIC_APP_URL: requiredProductionUrl.default('http://localhost:3000'),
    NEXT_PUBLIC_API_URL: requiredProductionUrl.default('http://localhost:3333'),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    SERVER_PORT: process.env.SERVER_PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_ISSUER: process.env.JWT_ISSUER,
    JWT_AUDIENCE: process.env.JWT_AUDIENCE,
    TOKEN_PEPPER: process.env.TOKEN_PEPPER,
    GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    GOOGLE_OAUTH_CLIENT_REDIRECT_URI:
      process.env.GOOGLE_OAUTH_CLIENT_REDIRECT_URI,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN:
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },

  emptyStringAsUndefined: true,
  skipValidation:
    process.env.SKIP_ENV_VALIDATION === 'true' || 'window' in globalThis,
})
