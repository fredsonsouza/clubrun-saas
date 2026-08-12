import { timingSafeEqual } from 'node:crypto'
import {
  clearOAuthTransaction,
  getOAuthTransaction,
  parseInternalRedirect,
  setSessionCookie,
} from '@/auth/cookies'
import { signInWithGoogle } from '@/http/sign-in-with-google'
import { env } from '@saas/env'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const callbackSchema = z.object({
  code: z.string().min(1),
  state: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
})

function statesMatch(receivedState: string, expectedState?: string) {
  if (!expectedState) return false

  const received = Buffer.from(receivedState, 'utf8')
  const expected = Buffer.from(expectedState, 'utf8')

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  )
}

export async function GET(request: NextRequest) {
  const parsed = callbackSchema.safeParse({
    code: request.nextUrl.searchParams.get('code'),
    state: request.nextUrl.searchParams.get('state'),
  })
  const transaction = await getOAuthTransaction()

  await clearOAuthTransaction()

  if (
    !parsed.success ||
    !statesMatch(parsed.data.state, transaction.state) ||
    !transaction.codeVerifier
  ) {
    return NextResponse.json(
      { message: 'Estado OAuth ausente ou inválido.' },
      { status: 400 }
    )
  }

  const { token } = await signInWithGoogle({
    code: parsed.data.code,
    state: parsed.data.state,
    codeVerifier: transaction.codeVerifier,
  })
  await setSessionCookie(token)

  const redirectTo = parseInternalRedirect(transaction.redirectTo)
  return NextResponse.redirect(new URL(redirectTo, env.NEXT_PUBLIC_APP_URL))
}
