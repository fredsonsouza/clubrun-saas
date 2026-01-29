import { redirect } from 'next/navigation'

export async function signInWithGoogle() {
  const googleSignInUrl = new URL(
    '/o/oauth2/v2/auth',
    'https://accounts.google.com'
  )

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

  return redirect(googleSignInUrl.toString())
}
