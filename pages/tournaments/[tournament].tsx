import { useRouter } from 'next/router'
import { Database } from '@/types/supabase'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { TournamentFormProps } from '../../types/form-types'; // Adjust the path based on your project structure
import { Matchup, Round, RoundMatches, Tournament } from '@/components/tournamentBrackets';
import NavBar from '@/components/navbar';

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
    const [addTournament, setAddTournament] = useState<boolean>(false);
    const router = useRouter();
    const [currentRound, setCurrentRound] = useState(1)

    function getRoundCount(numberOfTeams: number) {
      let roundCount = 0;
      let currentTeams = numberOfTeams;

      while (currentTeams > 1) {
        currentTeams /= 2;
        roundCount++;
      }
      return roundCount;
    }
    // const getMatches = async (tournament: Tournaments) => {
    //   const { data: data, error } = await supabase
    //     .from('matches')
    //     .select('*')
    //     .order('id', { ascending: true })
    //     .eq('tournament', tournament.id)
    //   if (error) {
    //     console.log(error)
    //     return
    //   } else {
    //     setTournamentMatches(data)
    //   }
    // }
  
    // const getRounds = async (tournament: Tournaments, tournamentMatches: Matches[]) => {
    //   const { data: data, error } = await supabase
    //     .from('rounds')
    //     .select('*')
    //     .order('round', { ascending: true })
    //     .eq('tournament', tournament.id)
    //   if (error) {
    //     console.log(error)
    //     return
    //   } else {
    //     setTournamentRounds(data)
    //   }
    // }

    function getRoundLength(matches: Matches[]): number {
      let roundLength: number = 1
      for (let i = 0; i < matches.length; i++) {
        if (roundLength < matches[i].round) {
          roundLength = matches[i].round;
        }
      }
      return roundLength
    }

    const linkMatches = async () => {
      if (matches) {
        let roundLength: number = getRoundLength(matches)
        for (let i = 1; i <= roundLength; i++) {
          for (let j = 0; j < matches.length; j++) {
            const tournamentMatch = matches[j]
            if (tournamentMatch.round == i) {
              // add previous rounds
              if (tournamentMatch.round > 1) {
                for (let k = 0; k < matches.length; k++) {
                  const previousMatch = matches[k];
                  if (previousMatch.round == i - 1 && previousMatch.match == (tournamentMatch.match * 2)) {
                    tournamentMatch.previous_match_2 = previousMatch.id;
                  }
                  if (previousMatch.round == i - 1 && previousMatch.match == ((tournamentMatch.match * 2) - 1)) {
                    tournamentMatch.previous_match_1 = previousMatch.id;
                  }
                }
              }
              // add next round
              if (tournamentMatch.round < roundLength) {
                for (let k = 0; k < matches.length; k++) {
                  const nextMatch = matches[k];
                  if (nextMatch.round == i + 1 && nextMatch.match == Math.ceil(tournamentMatch.match/2)) {
                    tournamentMatch.next_match = nextMatch.id;
                  }
                }
              }
              
              const { data, error } = await supabase
                .from('matches')
                .update(tournamentMatch)
                .eq('id', tournamentMatch.id)
                .select()
            }
          }
        }
        fetchMatches()
      }
    };

    async function setFirstRound() {
      let matchesSet: boolean = false
      if (matches && tournaments) {
        let roundLength: number = getRoundLength(matches)
        let roundOneMatches: number[] = []
        for (let i = 0; i < matches.length; i++) {
          const match = matches[i];
          if (match.round == 1) {
            // console.log("Team 1: " + ((match.team1 != null && match.team1 != "")) + " Team 2: " + match.team2)
            if ((match.team1 != null && match.team1 != "") || (match.team2 != null &&match.team2 != "")) {
              matchesSet = true
            } else {
              roundOneMatches.push(i)
            }
          }
        }
        if (!matchesSet) {
          let tournamentCount = 0 
          for (let i = 0; i < roundOneMatches.length; i++) {
            const match = matches[roundOneMatches[i]];
            if (tournamentCount < tournaments.teams.length) {
              match.team1 = tournaments.teams[tournamentCount];
            }
            tournamentCount++;
            if (tournamentCount < tournaments.teams.length) {
              match.team2 = tournaments.teams[tournamentCount];
            }
            tournamentCount++;
            const { data, error } = await supabase
              .from('matches')
              .update({ team1: match.team1, team2: match.team2 })
              .eq('id', match.id)
              .select()
          }
          linkMatches()
        }
        // update play html
      }
    }

    function updateTournament(round: number) {
      if (matches && tournaments) {
        let roundMatches: Matches[] = []
        for (let j = 0; j < matches.length; j++) {
          const element = matches[j];
          if (element.round == round && tournaments.id == element.tournament) {
            roundMatches.push(element)
          }
        }
        let tournamentRound: RoundMatches = {
          "matches": roundMatches,
          // "displayMatches": matchUps,
          "round": round
        }
        setPlayTournamentHTML(<Round round={{"matches": roundMatches, "round": round}} key={tournamentRound.round} router={router}/>)
      }
    }

    const fetchTournaments = async () => {
        try {
            if (typeof router.query.tournament == "string") {
              const { data: data, error } = await supabase
                .from('tournaments')
                .select('*')
                .eq('id', Number(router.query.tournament))
                .order('id', { ascending: true })
              if (error || data.length != 1) console.error('error', error)
              else {
                if (!tournaments) {
                  setTournaments(data[0]);
                }
                // setTournaments(data[0]);
                fetchMatches()
              } // Update the state with fetched data
            }
        } catch (error) {
            console.error('Error fetching tournaments:', error);
        }
    };

    const fetchMatches = async () => {
        try {
            if (typeof router.query.tournament == "string") {
              const { data: data, error } = await supabase
                .from('matches')
                .select('*')
                .eq('tournament', Number(router.query.tournament))
                .order('id', { ascending: true })
              if (error) console.error('error', error)
              else {
                if (!matches) {
                  setMatches(data)
                }
              }
            }
        } catch (error) {
            console.error('Error fetching matches:', error);
        }
    };

    useEffect(() => {
      if (router.isReady) {
        updateTournament(currentRound);
      }
    }, [matches, currentRound]);

    useEffect(() => {
      if (router.isReady) {
        fetchTournaments();
      }
    }, [router.isReady]);

    useEffect(() => {
      if (router.isReady) {
        setFirstRound();
      }
    }, [matches]);

    function nextRound() {
      let numOfTeams: number = 1;
      if (tournaments) {
        numOfTeams = tournaments.teams.length
      }
      let roundCount = getRoundCount(numOfTeams)
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

    return (
    <div>
      <NavBar></NavBar>
      <div>
        {playTournamentHTML}
      </div>
      <div>
        <button onClick={previousRound}>Previous</button>
        <button onClick={nextRound}>Next</button>
        <p>Round: {currentRound}</p>
      </div>
      <button onClick={editTournament}>Edit</button>
      <button onClick={goToWinnersPage}>Winners Page</button>
    </div>)
    }

export default TournamentPlayer;
