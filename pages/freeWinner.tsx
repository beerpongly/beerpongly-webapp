import { useRouter } from 'next/router'
import { Database } from '@/types/supabase'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { Tournament } from '@/components/tournamentBrackets';
import NavBar from '@/components/navbar';
import { Winner } from '@/components/Winner';
import { Footer } from '@/components/Footer';

type Tournaments = Database['public']['Tables']['tournaments']['Row']
type Matches = Database['public']['Tables']['matches']['Row']

function TournamentPlayer() {
    const initialTournamentData: Tournament = {
      id: 0,
      tournament_name: "",
      round_robin: false,
      teams: ["team 1", "team 2"]
    }
    const initialHtmlRounds: JSX.Element[] = []
    const supabase = useSupabaseClient<Database>()
    const session = useSession()
    const [tournaments, setTournaments] = useState<Tournaments>()
    const [matches, setMatches] = useState<Matches[]>()
    const [playTournamentHTML, setPlayTournamentHTML] = useState(<div></div>)
    const [finalMatch, setFinalMatch] = useState<string>();
    const router = useRouter();
    const [currentRound, setCurrentRound] = useState(1)

    async function findWinner() {
      const teams: string[] = JSON.parse(localStorage.getItem("teams") || "[]")
      const rounds: string[][] = JSON.parse(localStorage.getItem("rounds") || "[]")
      const winners: string[][] = JSON.parse(localStorage.getItem("winners") || "[]")
      console.log("rounds: " + rounds[rounds.length-1])
      if (rounds[rounds.length-1][0] != "") {
        setFinalMatch(rounds[rounds.length-1][0])
      } else {
        router.push({
          pathname: '/freeTournament'
        })
      }
    }
    
    async function tournament() {
      router.push("/freeTournament")
    }

    async function home() {
      router.push("/")
    }

    useEffect(() => {
      if (router.isReady) {
        findWinner();
      }
    }, [router.isReady]);

    return (
    <>
      <NavBar></NavBar>
      <div className="w-full h-full bg-white dark:bg-gray-900 text-center">
        <Winner winner={finalMatch ? finalMatch : ""}></Winner>
        {/* <h1 className='dark:text-white'>Winner: {finalMatch}</h1>
        <button
          onClick={() => tournament()}
          className="focus:outline-none text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900"
        >
          Tournaments
        </button>
        <button
          onClick={() => home()}
          className="focus:outline-none text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900"
        >
          Home
        </button> */}
      </div>
      <Footer></Footer>
      
    </>)
    }

export default TournamentPlayer;
