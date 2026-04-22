import React from 'react'
import { auth } from '@/auth/auth'
import { Club } from '@/components/club-card'
import { ExploreClubsClient } from './explore-clubs-client'

const MOCK_EXPLORE_CLUBS: Club[] = [
  {
    id: '1',
    name: 'Macuxi Runner',
    slug: 'macuxi-runner',
    description:
      'Treinos de alta performance no lavrado. Foco em maratonas e meia maratonas na região norte.',
    membersCount: 84,
    location: 'Boa Vista, RR',
    membershipStatus: 'MEMBER',
  },
  {
    id: '2',
    name: 'Elite Pace',
    slug: 'elite-pace',
    description:
      'Assessoria esportiva para quem busca quebrar recordes pessoais. Planilhas semanais.',
    membersCount: 120,
    location: 'São Paulo, SP',
    membershipStatus: 'NONE',
  },
  {
    id: '3',
    name: 'Trail Runners',
    slug: 'trail-runners',
    description:
      'Nossa paixão é a montanha e a terra. Grupo focado em ultramaratonas de trail.',
    membersCount: 45,
    location: 'Global',
    membershipStatus: 'PENDING',
  },
  {
    id: '4',
    name: 'Pista & Asfalto',
    slug: 'pista-asfalto',
    description: 'Treinos intervalados de terça e quinta. Longão no domingo.',
    membersCount: 32,
    location: 'Curitiba, PR',
    membershipStatus: 'NONE',
  },
]

export default async function ExploreClubsPage() {
  const { user } = await auth()

  return (
    <ExploreClubsClient user={user} initialClubs={MOCK_EXPLORE_CLUBS} />
  )
}
