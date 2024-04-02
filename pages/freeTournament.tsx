import { useRouter } from 'next/router'
import { Database } from '@/types/supabase'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { ReactElement, useEffect, useState } from 'react'
import { TournamentFormProps } from '../types/form-types'; // Adjust the path based on your project structure
import { Matchup, Round, RoundMatches, Tournament } from '@/components/tournamentBrackets';
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

    // const linkMatches = async () => {
    //   if (matches) {
    //     let roundLength: number = getRoundLength(matches)
    //     for (let i = 1; i <= roundLength; i++) {
    //       for (let j = 0; j < matches.length; j++) {
    //         const tournamentMatch = matches[j]
    //         if (tournamentMatch.round == i) {
    //           // add previous rounds
    //           if (tournamentMatch.round > 1) {
    //             for (let k = 0; k < matches.length; k++) {
    //               const previousMatch = matches[k];
    //               if (previousMatch.round == i - 1 && previousMatch.match == (tournamentMatch.match * 2)) {
    //                 tournamentMatch.previous_match_2 = previousMatch.id;
    //               }
    //               if (previousMatch.round == i - 1 && previousMatch.match == ((tournamentMatch.match * 2) - 1)) {
    //                 tournamentMatch.previous_match_1 = previousMatch.id;
    //               }
    //             }
    //           }
    //           // add next round
    //           if (tournamentMatch.round < roundLength) {
    //             for (let k = 0; k < matches.length; k++) {
    //               const nextMatch = matches[k];
    //               if (nextMatch.round == i + 1 && nextMatch.match == Math.ceil(tournamentMatch.match/2)) {
    //                 tournamentMatch.next_match = nextMatch.id;
    //               }
    //             }
    //           }
              
    //           const { data, error } = await supabase
    //             .from('matches')
    //             .update(tournamentMatch)
    //             .eq('id', tournamentMatch.id)
    //             .select()
    //         }
    //       }
    //     }
    //     fetchMatches()
    //   }
    // };

    // async function setFirstRound() {
    //   let matchesSet: boolean = false
    //   if (matches && tournaments) {
    //     let roundLength: number = getRoundLength(matches)
    //     let roundOneMatches: number[] = []
    //     for (let i = 0; i < matches.length; i++) {
    //       const match = matches[i];
    //       if (match.round == 1) {
    //         // console.log("Team 1: " + ((match.team1 != null && match.team1 != "")) + " Team 2: " + match.team2)
    //         if ((match.team1 != null && match.team1 != "") || (match.team2 != null &&match.team2 != "")) {
    //           matchesSet = true
    //         } else {
    //           roundOneMatches.push(i)
    //         }
    //       }
    //     }
    //     if (!matchesSet) {
    //       let tournamentCount = 0 
    //       for (let i = 0; i < roundOneMatches.length; i++) {
    //         const match = matches[roundOneMatches[i]];
    //         if (tournamentCount < tournaments.teams.length) {
    //           match.team1 = tournaments.teams[tournamentCount];
    //         }
    //         tournamentCount++;
    //         if (tournamentCount < tournaments.teams.length) {
    //           match.team2 = tournaments.teams[tournamentCount];
    //         }
    //         tournamentCount++;
    //         const {} = await supabase
    //           .from('matches')
    //           .update({ team1: match.team1, team2: match.team2 })
    //           .eq('id', match.id)
    //           .select()
    //         const {} = await supabase
    //           .from('tournaments')
    //           .update({ progress: 1 })
    //           .eq("id", tournaments.id)
    //           .select()
    //       }
    //       linkMatches()
    //     }
    //     // update play html
    //   }
    // }
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

    // function updateTournament(round: number) {
    //   if (matches && tournaments) {
    //     let roundMatches: Matches[] = []
    //     for (let j = 0; j < matches.length; j++) {
    //       const element = matches[j];
    //       if (element.round == round && tournaments.id == element.tournament) {
    //         roundMatches.push(element)
    //       }
    //     }
    //     let tournamentRound: RoundMatches = {
    //       "matches": roundMatches,
    //       // "displayMatches": matchUps,
    //       "round": round
    //     }
    //     setPlayTournamentHTML(
    //       <div>
    //         <Round round={{"matches": roundMatches, "round": round}} key={tournamentRound.round} router={router} tournament={tournaments}/>
    //       </div>
    //     )
    //   }
    // }

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

    // useEffect(() => {
    //   if (router.isReady) {
    //     updateTournament(currentRound);
    //   }
    // }, [rounds, currentRound]);

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
      let numOfTeams: number = 1;
      if (tournaments) {
        numOfTeams = tournaments.teams.length
      }
      // let roundCount = getRoundCount(numOfTeams)
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
      if (tournaments) {
        router.push("/tournaments/" + tournaments.id + "/edit")
      }
    }

    function goToWinnersPage() {
      if (tournaments) {
        router.push("/tournaments/" + tournaments.id + "/winner")
      }
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
