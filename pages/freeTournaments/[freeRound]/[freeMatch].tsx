import { useRouter } from 'next/router'
import { Database } from '@/types/supabase'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import NavBar from '@/components/navbar';

type Tournaments = Database['public']['Tables']['tournaments']['Row']
type Matches = Database['public']['Tables']['matches']['Row']

function TournamentPlayer() {
    const supabase = useSupabaseClient<Database>()
    const [currentmatch, setCurrentMatch] = useState<string>("")
    const [currentRound, setCurrentRound] = useState<string>("")
    const [team1, setTeam1] = useState<string>("")
    const [team2, setTeam2] = useState<string>("")
    const router = useRouter();
    const [teams, setTeams] = useState<string[]>([])
    const [rounds, setRounds] = useState<string[][]>([])
    const [winners, setWinners] = useState<string[][]>([])

    const processWinner = async (winner: boolean) => {
      const round = router.query.freeRound
      const match = router.query.freeMatch
      console.log(winner)
      console.log(round)
      console.log(match)
      if (winner) {
        if (typeof match == "string" && typeof round == "string") {
          rounds[Number(round)][Number(match)] = team1
          winners[Number(round)-1][Number(match)*2] = "winner"
          winners[Number(round)-1][Number(match)*2+1] = "loser"
        }
      } else {
        if (typeof match == "string" && typeof round == "string") {
          rounds[Number(round)][Number(match)] = team2
          winners[Number(round)-1][Number(match)*2] = "loser"
          winners[Number(round)-1][Number(match)*2+1] = "winner"
        }
      }
      localStorage.setItem("rounds", JSON.stringify(rounds))
      localStorage.setItem("winners", JSON.stringify(winners))
      console.log(rounds)
      if (rounds[rounds.length-1][0] != "") {
        router.push({
          pathname: '/freeWinner'
        })
      } else {
        router.push({
          pathname: '/freeTournament',
          query: {round: Number(round) + 1}
        })
      }
    }

    const fetchMatch = async () => {
        // TODO return to tournament if match id and tournament id in match dont match
        try {
          const round = router.query.freeRound
          const match = router.query.freeMatch
            if (typeof round == "string" && typeof match == "string") {
              setCurrentRound(round)
              setCurrentMatch(match)
              
              console.log("Team1: " + rounds[Number(round)-1][Number(match)*2])
              console.log("Team2: " + rounds[Number(round)-1][Number(match)*2+1])
              console.log("test")
              setTeam1(rounds[Number(round)-1][Number(match)*2])
              setTeam2(rounds[Number(round)-1][Number(match)*2+1])
                // if (!match && data.length == 1) {
                //   setMatch(data[0])
                // }
              
            }
        } catch (error) {
            console.error('Error fetching matches:', error);
        }
    };

    useEffect(() => {
      if (router.isReady) {
        console.log(router.query.freeRound);
        console.log(router.query.freeMatch);
        setTeams(JSON.parse(localStorage.getItem("teams") || "[]"))
        setRounds(JSON.parse(localStorage.getItem("rounds") || "[]"))
        setWinners(JSON.parse(localStorage.getItem("winners") || "[]"))
      }
    }, [router.isReady]);

    useEffect(() => {
      if (router.isReady) {
        fetchMatch();
      }
    }, [rounds]);

    return (
      <>
      <NavBar></NavBar>
      <section className="w-full h-full bg-white dark:bg-gray-900 text-center">
          <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white">Tournament Name: Free Tournament</h1>
          <p className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Round: {currentRound}</p>
          <p className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Teams: {team1}</p>
          <button onClick={() =>processWinner(true)} className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
            {team1} Wins!
          </button>
          <p className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Teams: {team2}</p>
          <button onClick={() =>processWinner(false)} className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
            {team2} Wins!
          </button> 
          <br />
      </section>
      </>
    )
  }

export default TournamentPlayer;
