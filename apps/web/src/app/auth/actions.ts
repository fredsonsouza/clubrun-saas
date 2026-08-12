'use server'

import { createHash, randomBytes } from 'node:crypto'
import { parseInternalRedirect, setOAuthTransaction } from '@/auth/cookies'
import { createOAuthAttempt } from '@/http/create-oauth-attempt'
import { env } from '@saas/env'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export async function signInWithGoogle(formData?: FormData) {
  const googleSignInUrl = new URL(
    '/o/oauth2/v2/auth',
    'https://accounts.google.com'
  )

  const redirectTo = parseInternalRedirect(
    z.string().optional().parse(formData?.get('redirectTo')?.toString())
  )
  const state = randomBytes(32).toString('base64url')
  const codeVerifier = randomBytes(32).toString('base64url')
  const pkceChallenge = createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')

  await createOAuthAttempt({ state, pkceChallenge })
  await setOAuthTransaction(state, redirectTo, codeVerifier)

  googleSignInUrl.searchParams.set('client_id', env.GOOGLE_OAUTH_CLIENT_ID)
  googleSignInUrl.searchParams.set(
    'redirect_uri',
    env.GOOGLE_OAUTH_CLIENT_REDIRECT_URI
  )
  googleSignInUrl.searchParams.set('response_type', 'code')
  googleSignInUrl.searchParams.set('scope', 'openid email profile')
  googleSignInUrl.searchParams.set('state', state)
  googleSignInUrl.searchParams.set('code_challenge', pkceChallenge)
  googleSignInUrl.searchParams.set('code_challenge_method', 'S256')

  return redirect(googleSignInUrl.toString())
}
