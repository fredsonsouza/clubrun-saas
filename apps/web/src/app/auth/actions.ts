import { redirect } from 'next/navigation'

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
    '415804455100-l9d0fqkj1lqmaf2gnsgd79e489jeeq2b.apps.googleusercontent.com'
  )
  googleSignInUrl.searchParams.set(
    'redirect_uri',
    'http://localhost:3000/api/auth/callback'
  )
  googleSignInUrl.searchParams.set('response_type', 'code')
  googleSignInUrl.searchParams.set('scope', 'openid email profile')
  googleSignInUrl.searchParams.set('state', state)

  return redirect(googleSignInUrl.toString())
}
