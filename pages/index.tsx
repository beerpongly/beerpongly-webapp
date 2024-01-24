import Head from 'next/head'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import TournamentList from '@/components/TournamentList'
import TournamentForm from '@/components/CreateTournament';
import NavBar from '@/components/navbar';

export default function Home() {
  const session = useSession()
  const supabase = useSupabaseClient()

  return (
    <>
      <NavBar></NavBar>
      <div className="w-full h-full bg-gray-200">
        {!session ? (
          // reoute to home
          <></>
        ) : (
          // TODO make this the landing page
          <div>
            <a href="/tournaments" className="text-sm font-semibold leading-6 text-gray-900">View Tournaments</a>
          </div>
        )}
      </div>
    </>
  )
}
