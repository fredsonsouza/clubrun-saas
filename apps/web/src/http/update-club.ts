import { api } from './api-client'

interface UpdateClubRequest {
  slug: string
  name: string
  domain?: string | null
  cnpj?: string | null
  shouldAttachUsersByDomain?: boolean
}

export async function updateClub({
  slug,
  name,
  domain,
  cnpj,
  shouldAttachUsersByDomain,
}: UpdateClubRequest) {
  await api.put(`clubs/${slug}`, {
    json: {
      name,
      domain,
      cnpj,
      shouldAttachUsersByDomain,
    },
  })
}

export async function shutdownClub(slug: string) {
  await api.delete(`clubs/${slug}`)
}
