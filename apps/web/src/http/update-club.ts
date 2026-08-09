import { mutationApi } from './api-client'

interface UpdateClubRequest {
  slug: string
  name: string
  domain?: string | null
  cnpj?: string | null
  description?: string | null
  city?: string | null
  state?: string | null
  avatarUrl?: string | null
  bannerUrl?: string | null
  shouldAttachUsersByDomain?: boolean
}

export async function updateClub({
  slug,
  name,
  domain,
  cnpj,
  description,
  city,
  state,
  avatarUrl,
  bannerUrl,
  shouldAttachUsersByDomain,
}: UpdateClubRequest) {
  await mutationApi.put(`clubs/${slug}`, {
    json: {
      name,
      domain,
      cnpj,
      description,
      city,
      state,
      avatarUrl,
      bannerUrl,
      shouldAttachUsersByDomain,
    },
  })
}

export async function shutdownClub(slug: string) {
  await mutationApi.delete(`clubs/${slug}`)
}
