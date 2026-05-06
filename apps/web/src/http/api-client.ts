import ky from 'ky'
import { env } from '@saas/env'

export const api = ky.create({
  prefixUrl: env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',

  hooks: {
    beforeRequest: [
      async (request) => {
        if (typeof window === 'undefined') {
          const { cookies } = await import('next/headers')
          const cookieStore = await cookies()
          const token = cookieStore.get('token')?.value

          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`)
          }
        } else {
          const { getCookie } = await import('cookies-next')
          const token = getCookie('token')

          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`)
          }
        }
      },
    ],
  },
})
