import AthletesPage from '@/components/athletes-page'
import ClubsDashboardPage from '@/components/club-dashboard'
import Footer from '@/components/footer'
import Header from '@/components/header'
import RacesPage from '@/components/races-page'
import WorkoutsPage from '@/components/workouts-page'

export default async function Home() {
  return (
    <div className="py-4">
      <Header />
      {/* <AthletesPage /> */}
      {/* <ClubsDashboardPage /> */}
      {/* <WorkoutsPage /> */}
      <RacesPage />
      <main></main>
      <Footer />
    </div>
  )
}
