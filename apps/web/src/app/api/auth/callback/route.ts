import { signInWithGoogle } from '@/http/sign-in-with-google'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json(
      {
        message: 'Google OAuth code was not found',
      },
      {
        status: 400,
      }
    )
  }

  const { token } = await signInWithGoogle({ code })

  ;(await cookies()).set('token', token, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, //7 days
  })

  const state = searchParams.get('state')
  let redirectTo = '/'

  if (state) {
    try {
      const parsedState = JSON.parse(state)
      if (parsedState.redirectTo) {
        const params = new URLSearchParams()
        if (parsedState.token) params.set('token', parsedState.token)
        if (parsedState.inviteId) params.set('inviteId', parsedState.inviteId)
        
        const queryString = params.toString()
        redirectTo = `${parsedState.redirectTo}${queryString ? `?${queryString}` : ''}`
      }
    } catch (e) {
      console.error('Falha ao processar o state do Google:', e)
    }
  }

  return NextResponse.redirect(new URL(redirectTo, request.nextUrl))
}
