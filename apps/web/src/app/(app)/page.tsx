import AthleteProfilePage from '@/components/athlete-profile-page'
import AthletesPage from '@/components/athletes-page'
import ClubDashboardPage from '@/components/clubs-dashboard'
import Header from '@/components/header'
import RacesPage from '@/components/races-page'
import { RankingTable } from '@/components/ranking-table'
import RankingsPage from '@/components/rankings-page'
import WorkoutsPage from '@/components/workouts-page'

export default async function Home() {
  return (
    <div className="py-4">
      <Header />
      <ClubDashboardPage />
      {/* <WorkoutsPage /> */}
      {/* <AthletesPage /> */}
      {/* <AthleteProfilePage /> */}
      {/* <RankingsPage /> */}
      {/* <RacesPage /> */}

      <main className="mx-auto mt-20 max-w-7xl"></main>
    </div>
  )
}
