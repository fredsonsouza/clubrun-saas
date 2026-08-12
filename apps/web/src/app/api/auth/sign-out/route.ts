import { clearSessionCookie } from '@/auth/cookies'
import { env } from '@saas/env'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const redirectUrl = new URL('/auth/sign-in', env.NEXT_PUBLIC_APP_URL)

  await clearSessionCookie()

  return NextResponse.redirect(redirectUrl)
}
