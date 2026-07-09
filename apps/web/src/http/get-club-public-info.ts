import { api } from './api-client'

interface GetClubPublicInfoResponse {
  club: {
    id: string
    name: string
    slug: string
    avatarUrl: string | null
    description: string | null
  }
}

export async function getClubPublicInfo(
  slug: string
): Promise<GetClubPublicInfoResponse> {
  return await api.get(`clubs/${slug}/public`).json<GetClubPublicInfoResponse>()
}
