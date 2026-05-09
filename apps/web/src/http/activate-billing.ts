import { api } from './api-client'

export async function activateClubBilling(slug: string) {
  await api.patch(`clubs/${slug}/billing/activate`)
}
