import { auth } from '@/auth/auth'
import { FeedbackButton } from '@/components/feedback-button'
import { SessionCookieSync } from '@/components/session-cookie-sync'
import { redirect } from 'next/navigation'

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user } = await auth()

  if (!user) {
    redirect('/auth/sign-in')
  }

  /* Temporariamente desativado
  if (!user.emailVerifiedAt) {
    redirect('/auth/verify-email')
  }
  */

  return (
    <>
      <SessionCookieSync isPremium={user.isPremium} />
      {children}
      <FeedbackButton />
    </>
  )
}
