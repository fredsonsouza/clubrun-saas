'use client'

import { useEffect } from 'react'

export function SessionSynchronizer() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSubscribedCookie = document.cookie.includes('athlete_subscribed=true')
      if (hasSubscribedCookie) {
        localStorage.setItem('clubrun:athlete_subscribed', 'true')
      } else {
        localStorage.removeItem('clubrun:athlete_subscribed')
      }
    }
  }, [])

  return null
}
