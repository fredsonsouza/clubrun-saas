import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import { env } from '@saas/env'

export async function GET(request: NextRequest) {
  const redirectUrl = new URL('/auth/sign-in', env.NEXT_PUBLIC_APP_URL)

  const cookieStore = await cookies()
  cookieStore.delete('token')
  cookieStore.delete('athlete_subscribed')

  return NextResponse.redirect(redirectUrl)
}
