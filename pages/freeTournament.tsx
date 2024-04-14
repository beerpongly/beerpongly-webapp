import { useRouter } from 'next/router'
import { Database } from '@/types/supabase'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { ReactElement, useEffect, useState } from 'react'
import { TournamentFormProps } from '../types/form-types'; // Adjust the path based on your project structure
// import { Matchup, Round, RoundMatches, Tournament } from '@/components/tournamentBrackets';
import NavBar from '@/components/navbar';

type Tournaments = Database['public']['Tables']['tournaments']['Row']
type Matches = Database['public']['Tables']['matches']['Row']

function TournamentPlayer() {
    const supabase = useSupabaseClient<Database>()
    const session = useSession()
    const [playTournamentHTML, setPlayTournamentHTML] = useState(<div></div>)
    const [roundCount, setRoundCount] = useState<number>(0);
    const router = useRouter();
    const [currentRound, setCurrentRound] = useState(1)
    const positions: number[][] = [
      [0],
      [0, 1],
      [0, 3, 2, 1],
      [0, 7, 4, 3, 2, 5, 6, 1],
      [0, 15, 8, 7, 4, 11, 12, 3, 2, 13, 10, 5, 6, 9, 14, 1],
    ]

    interface Match {
      team1: string
      team2: string
      team1Position: number
      team2Position: number
      winner: undefined | boolean
    }

    function getRoundCount(numberOfTeams: number) {
      let roundCount = 0;
      let currentTeams = numberOfTeams;

      while (currentTeams > 1) {
        currentTeams /= 2;
        roundCount++;
      }
      return roundCount;
    }

    function getRoundLength(matches: Matches[]): number {
      let roundLength: number = 1
      for (let i = 0; i < matches.length; i++) {
        if (roundLength < matches[i].round) {
          roundLength = matches[i].round;
        }
      }
      return roundLength
    }

    function Match({team1, team2, team1Position, team2Position, winner}: Match) {
      return (
        <main className="">
          <div className="text-center border-t-2 rounded-lg text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
            {/* <TopBracket team={topTeam} position={topTeam}/> */}
            <div className="flex justify-start">
              <div className="box-border h-10 w-10 p-1 border-r-2 rounded-tl-lg">
                <p className="inline-block align-middle">{team1Position}</p>
              </div>
  {/* // text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white */}
              <div className="box-border h-10 w-40 p-1 rounded-tr-lg">
                <p className={`inline-block align-middle ${winner == false ? 'line-through' : ''}`}>{team1}</p>
              </div>
            </div>
            {/* <BottomBracket team={bottomTeam} position={bottomTeam}/> */}
            <div className="flex justify-start box-border border-gray-400 max-w-50">
              <div className="box-border h-10 w-10 p-1 border-t-2 border-r-2 rounded-bl-lg">
                <p className="inline-block align-middle">{team2Position}</p>
              </div>
              <div className="box-border h-10 w-40 p-1 border-t-2 rounded-br-lg">
                <p className={`inline-block align-middle ${winner == true ? 'line-through' : ''}`}>{team2}</p>
              </div>
            </div>
          </div>
        </main>
      )
    }
  
    function onPlay(match: number) {
      router.push("/freeTournaments/" + String(currentRound) + "/" + String(match))
      // if (tournament.progress >= match.round) {
      //   router.push("/freeTournaments/" + String(match))
      // } else {
      //   console.log("Cannot play future rounds!")
      // }
    }

    function findPosition(team: string) {
      const teams: string[] = JSON.parse(localStorage.getItem("teams") || "[]")
      let round = 0
      for (let i = 0; i < teams.length; i++) {
        if (team == teams[i]) {
          round = i;
        }
      }
      return round + 1
    }
    
    function Round() {
      const teams: string[] = JSON.parse(localStorage.getItem("teams") || "[]")
      const rounds: string[][] = JSON.parse(localStorage.getItem("rounds") || "[]")
      const winners: string[][] = JSON.parse(localStorage.getItem("winners") || "[]")
      let matches = []
      for (let index = 0; (index * 2) < rounds[currentRound-1].length; index++) {
        console.log("round: " + rounds)
        let winner: undefined | boolean
        let i = index * 2
        console.log("Index: " + index + " i: " + i + " round length: " + rounds[currentRound-1].length)
        if (winners[currentRound-1][i] == "winner" && winners[currentRound-1][i+1] == "loser") {
          winner = true
        } else if (winners[currentRound-1][i] == "loser" && winners[currentRound-1][i+1] == "winner") {
          winner = false
        }
        matches.push(
          <div onClick={() => onPlay(index)}>
            <Match
              key={index}
              team1={rounds[currentRound-1][i]}
              team2={rounds[currentRound-1][i+1]}
              team1Position={findPosition(rounds[currentRound-1][i])}
              team2Position={findPosition(rounds[currentRound-1][i+1])}
              winner={winner}
            />
          </div>
        );
      }
      console.log(matches.length)
      return (
        <div className='grid grid-cols-1 gap-4'>
          {matches}
        </div>
      )
    }

    async function setFirstRound() {
      const teams: string[] = JSON.parse(localStorage.getItem("teams") || "[]")
      const rounds: string[][] = JSON.parse(localStorage.getItem("rounds") || "[]")
      if(rounds.length > 0) {
        let position: number[] = positions[rounds.length - 1]
        if (position.length == rounds[0].length) {
          for (let i = 0; i < position.length; i++) {
            if (i < teams.length) {
              rounds[0][position[i]] = teams[i]
            } else {
              rounds[0][position[i]] = "pass"
            }
          }
        }
      }
      console.log(rounds)
      localStorage.setItem("rounds", JSON.stringify(rounds))
    }

    function updateTournament() {
        setPlayTournamentHTML(
          <div>
            <Round/>
          </div>
        )
    }

    const fetchTournaments = async () => {
      const teams: string[] = JSON.parse(localStorage.getItem("teams") || "[]")
      setRoundCount(getRoundCount(teams.length))
        // try {
        //     if (typeof router.query.tournament == "string") {
        //       const { data: data, error } = await supabase
        //         .from('tournaments')
        //         .select('*')
        //         .eq('id', Number(router.query.tournament))
        //         .order('id', { ascending: true })
        //       if (error || data.length != 1) console.error('error', error)
        //       else {
        //         if (!tournaments) {
        //           setTournaments(data[0]);
        //           setRoundCount(getRoundCount(data[0].teams.length))
        //         }
        //         // setTournaments(data[0]);
        //         fetchMatches()
        //       } // Update the state with fetched data
        //     }
        // } catch (error) {
        //     console.error('Error fetching tournaments:', error);
        // }
    };

    // const fetchMatches = async () => {
    //     try {
    //         if (typeof router.query.tournament == "string") {
    //           const { data: data, error } = await supabase
    //             .from('matches')
    //             .select('*')
    //             .eq('tournament', Number(router.query.tournament))
    //             .order('id', { ascending: true })
    //           if (error) console.error('error', error)
    //           else {
    //             if (!matches) {
    //               setMatches(data)
    //             }
    //           }
    //         }
    //     } catch (error) {
    //         console.error('Error fetching matches:', error);
    //     }
    // };

    useEffect(() => {
      if (router.isReady) {
        updateTournament();
      }
    }, [currentRound]);

    useEffect(() => {
      if (router.isReady) {
        fetchTournaments();
      }
    }, [router.isReady]);

    useEffect(() => {
      if (router.isReady) {
        setFirstRound();
      }
    }, [roundCount]);

    function nextRound() {
      const teams: string[] = JSON.parse(localStorage.getItem("teams") || "[]")
      let roundCount = getRoundCount(teams.length)
      if (currentRound < roundCount) {
        setCurrentRound(currentRound + 1)
      }
    }

    function previousRound() {
      if (currentRound > 1) {
        setCurrentRound(currentRound - 1)
      }
    }

    function editTournament() {
      router.push("/freeEdit")
    }

    function goToWinnersPage() {
      router.push("/freeWinner")
    }

    function pageinator() {
      let page_list: ReactElement[]  = []
      for (let i = 0; i < roundCount; i++) {
        page_list.push(
          <li>
            <p onClick={() => setCurrentRound(i+1)} className={i+1 == currentRound ? "flex items-center justify-center px-3 h-8 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white" : "flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"}>{i+1}</p>
          </li>
        )
      }
      return (
        <nav aria-label="Page navigation example">
          <ul className="inline-flex -space-x-px text-sm">
            <li>
              <p onClick={previousRound} className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Previous</p>
            </li>
            {page_list}
            <li>
              <p onClick={nextRound} className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Next</p>
            </li>
          </ul>
        </nav>
      )
    }

    return (
    <div className='justify-center h-screen bg-gray-50 dark:bg-gray-900'>
      <NavBar></NavBar>
      <br />
      <div className='flex justify-center grid grid-cols-1 gap-4 items-center'>
        <div className='flex justify-center'>
          {pageinator()}
        </div>
        
        <div className='flex justify-center'>
          <button onClick={editTournament} className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'>Edit</button>
          <button onClick={goToWinnersPage} className='focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800'>Winners Page</button>
        </div>
        <div className='flex justify-center'>
          <div>
            {playTournamentHTML}
          </div>
        </div>
      </div>
    </div>)
    }

export default TournamentPlayer;
