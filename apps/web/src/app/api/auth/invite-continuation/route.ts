import {
  getSessionToken,
  parseInternalRedirect,
  setInviteContinuation,
} from '@/auth/cookies'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const continuationSchema = z
  .object({
    token: z.string().min(1).max(4096).optional(),
    inviteId: z.string().min(1).max(256).optional(),
  })
  .refine((value) => value.token || value.inviteId)

export async function GET(request: NextRequest) {
  const parsed = continuationSchema.safeParse({
    token: request.nextUrl.searchParams.get('token') || undefined,
    inviteId: request.nextUrl.searchParams.get('inviteId') || undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ message: 'Convite inválido.' }, { status: 400 })
  }

  const continueTo = parseInternalRedirect(
    request.nextUrl.searchParams.get('continueTo')
  )
  await setInviteContinuation(parsed.data)

  const destination = (await getSessionToken())
    ? continueTo
    : `/auth/sign-in?redirectTo=${encodeURIComponent(continueTo)}`

  return NextResponse.redirect(new URL(destination, request.nextUrl.origin))
}
