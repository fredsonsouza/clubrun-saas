import 'server-only'

import { getSessionToken } from '@/auth/cookies'
import { env } from '@saas/env'
import ky from 'ky'

export const api = ky.create({
  prefixUrl: env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
  retry: {
    limit: 2,
    methods: ['get', 'head'],
  },

  hooks: {
    beforeRequest: [
      async (request) => {
        const token = await getSessionToken()

        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
  },
})

export const mutationApi = api.extend({
  retry: 0,
})
