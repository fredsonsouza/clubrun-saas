import { api } from './api-client'

interface GetClubResponse {
  club: {
    id: string
    name: string
    slug: string
    avatarUrl: string | null
    bannerUrl: string | null
    description: string | null
    city: string | null
    state: string | null
    cnpj: string | null
    domain: string | null
    shouldAttachUsersByDomain: boolean
    status: 'ACTIVE' | 'DEACTIVATED'
    subscriptionStatus: string | null
    ownerId: string
  }
  membership: {
    role: string
  }
}

export async function getClub(slug: string) {
  const result = await api.get(`clubs/${slug}`).json<GetClubResponse>()

  return result
}
