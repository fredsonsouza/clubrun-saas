'use client'

import { useEffect } from 'react'

interface SessionCookieSyncProps {
  isPremium: boolean
}

export function SessionCookieSync({ isPremium }: SessionCookieSyncProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSubscribedCookie = document.cookie.includes('athlete_subscribed=true')
      if (isPremium && !hasSubscribedCookie) {
        document.cookie = 'athlete_subscribed=true; path=/; max-age=31536000'
        localStorage.setItem('clubrun:athlete_subscribed', 'true')
      } else if (!isPremium && hasSubscribedCookie) {
        document.cookie = 'athlete_subscribed=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        localStorage.removeItem('clubrun:athlete_subscribed')
      }
    }
  }, [isPremium])

  return null
}
