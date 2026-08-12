import 'server-only'

import { cookies } from 'next/headers'
import { z } from 'zod'

export const SESSION_COOKIE_NAME = 'token'
export const OAUTH_STATE_COOKIE_NAME = 'oauth_state'
export const OAUTH_REDIRECT_COOKIE_NAME = 'oauth_redirect'
export const OAUTH_PKCE_VERIFIER_COOKIE_NAME = 'oauth_pkce_verifier'
export const INVITE_CONTINUATION_COOKIE_NAME = 'invite_continuation'

const SESSION_MAX_AGE = 60 * 60 * 24
const OAUTH_MAX_AGE = 60 * 10

const cookieSecurityOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

const internalRedirectSchema = z
  .string()
  .max(2048)
  .refine(
    (value) =>
      value.startsWith('/') &&
      !value.startsWith('//') &&
      !value.includes('\\') &&
      !value.includes('://'),
    { message: 'Redirecionamento interno inválido.' }
  )

const inviteContinuationSchema = z
  .object({
    token: z.string().min(1).max(4096).optional(),
    inviteId: z.string().min(1).max(256).optional(),
  })
  .refine((value) => value.token || value.inviteId)

export type InviteContinuation = z.infer<typeof inviteContinuationSchema>

export function parseInternalRedirect(value: unknown, fallback = '/') {
  const parsed = internalRedirectSchema.safeParse(value)
  return parsed.success ? parsed.data : fallback
}

export async function getSessionToken() {
  return (await cookies()).get(SESSION_COOKIE_NAME)?.value
}

export async function setSessionCookie(token: string) {
  ;(await cookies()).set(SESSION_COOKIE_NAME, token, {
    ...cookieSecurityOptions,
    maxAge: SESSION_MAX_AGE,
  })
}

export async function clearSessionCookie() {
  ;(await cookies()).set(SESSION_COOKIE_NAME, '', {
    ...cookieSecurityOptions,
    maxAge: 0,
  })
}

export async function setOAuthTransaction(
  state: string,
  redirectTo: string,
  codeVerifier: string
) {
  const cookieStore = await cookies()
  const options = { ...cookieSecurityOptions, maxAge: OAUTH_MAX_AGE }

  cookieStore.set(OAUTH_STATE_COOKIE_NAME, state, options)
  cookieStore.set(
    OAUTH_REDIRECT_COOKIE_NAME,
    parseInternalRedirect(redirectTo),
    options
  )
  cookieStore.set(OAUTH_PKCE_VERIFIER_COOKIE_NAME, codeVerifier, options)
}

export async function getOAuthTransaction() {
  const cookieStore = await cookies()

  return {
    state: cookieStore.get(OAUTH_STATE_COOKIE_NAME)?.value,
    redirectTo: parseInternalRedirect(
      cookieStore.get(OAUTH_REDIRECT_COOKIE_NAME)?.value
    ),
    codeVerifier: cookieStore.get(OAUTH_PKCE_VERIFIER_COOKIE_NAME)?.value,
  }
}

export async function clearOAuthTransaction() {
  const cookieStore = await cookies()
  const options = { ...cookieSecurityOptions, maxAge: 0 }

  cookieStore.set(OAUTH_STATE_COOKIE_NAME, '', options)
  cookieStore.set(OAUTH_REDIRECT_COOKIE_NAME, '', options)
  cookieStore.set(OAUTH_PKCE_VERIFIER_COOKIE_NAME, '', options)
}

export async function setInviteContinuation(value: InviteContinuation) {
  const continuation = inviteContinuationSchema.parse(value)
  ;(await cookies()).set(
    INVITE_CONTINUATION_COOKIE_NAME,
    JSON.stringify(continuation),
    {
      ...cookieSecurityOptions,
      maxAge: SESSION_MAX_AGE,
    }
  )
}

export async function getInviteContinuation() {
  const rawValue = (await cookies()).get(INVITE_CONTINUATION_COOKIE_NAME)?.value
  if (!rawValue) return null

  try {
    const parsed = inviteContinuationSchema.safeParse(JSON.parse(rawValue))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export async function clearInviteContinuation() {
  ;(await cookies()).set(INVITE_CONTINUATION_COOKIE_NAME, '', {
    ...cookieSecurityOptions,
    maxAge: 0,
  })
}
