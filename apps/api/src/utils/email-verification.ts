import { env } from '@saas/env'

export function shouldBypassEmailVerification() {
  return (
    process.env.NODE_ENV === 'development' &&
    env.BYPASS_EMAIL_VERIFICATION === 'true'
  )
}
