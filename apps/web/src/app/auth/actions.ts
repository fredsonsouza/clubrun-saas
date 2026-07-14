import { redirect } from 'next/navigation'
import { env } from '@saas/env'

export async function signInWithGoogle(formData?: FormData) {
  const googleSignInUrl = new URL(
    '/o/oauth2/v2/auth',
    'https://accounts.google.com'
  )

  const redirectTo = formData?.get('redirectTo')?.toString()
  const token = formData?.get('token')?.toString()
  const inviteId = formData?.get('inviteId')?.toString()

  const state = JSON.stringify({ redirectTo, token, inviteId })

  googleSignInUrl.searchParams.set(
    'client_id',
    env.GOOGLE_OAUTH_CLIENT_ID
  )
  googleSignInUrl.searchParams.set(
    'redirect_uri',
    env.GOOGLE_OAUTH_CLIENT_REDIRECT_URI
  )
  googleSignInUrl.searchParams.set('response_type', 'code')
  googleSignInUrl.searchParams.set('scope', 'openid email profile')
  googleSignInUrl.searchParams.set('state', state)

  return redirect(googleSignInUrl.toString())
}
