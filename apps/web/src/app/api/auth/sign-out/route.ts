import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone()

  redirectUrl.pathname = '/auth/sign-in'
  
  const cookieStore = await cookies()
  cookieStore.delete('token')
  cookieStore.delete('athlete_subscribed')

  return NextResponse.redirect(redirectUrl)
}
