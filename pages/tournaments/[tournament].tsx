import { useRouter } from 'next/router'
import { Database } from '@/types/supabase'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { TournamentFormProps } from '../../types/form-types'; // Adjust the path based on your project structure
import { BracketTeam, Matchup, Round, RoundMatches, Tournament } from '@/components/tournamentBrackets';
import NavBar from '@/components/navbar';

type Tournaments = Database['public']['Tables']['tournaments']['Row']
type Rounds = Database['public']['Tables']['rounds']['Row']
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
    const [rounds, setRounds] = useState<Rounds[]>()
    const [matches, setMatches] = useState<Matches[]>()
    const [playTournamentHTML, setPlayTournamentHTML] = useState(<div></div>)
    const [addTournament, setAddTournament] = useState<boolean>(false);
    const router = useRouter();
    const [currentRound, setCurrentRound] = useState(1)
    console.log(router.asPath)

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
  
    const linkMatches = async () => {
      if (matches && rounds) {
        for (let i = 0; i < rounds.length; i++) {
            const tournamentRound = rounds[i]
          for (let j = 0; j < matches.length; j++) {
            const tournamentMatch = matches[j]
            if (tournamentMatch.round == tournamentRound.id) {
              // add previous rounds
              if (tournamentRound.round > 1) {
                for (let k = 0; k < matches.length; k++) {
                  const previousMatch = matches[k];
                  if (previousMatch.round == rounds[i - 1].id && previousMatch.match == (tournamentMatch.match * 2)) {
                    tournamentMatch.previous_match_2 = previousMatch.id;
                  }
                  if (previousMatch.round == rounds[i - 1].id && previousMatch.match == ((tournamentMatch.match * 2) - 1)) {
                    tournamentMatch.previous_match_1 = previousMatch.id;
                  }
                }
              }
              // add next round
              if (tournamentRound.round < rounds.length) {
                for (let k = 0; k < matches.length; k++) {
                  const nextMatch = matches[k];
                  if (nextMatch.round == rounds[i + 1].id && nextMatch.match == Math.ceil(tournamentMatch.match/2)) {
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
      if (matches && tournaments && rounds) {
        let roundOneMatches: number[] = []
        let firstRoundId: number | undefined = undefined
        for (let j = 0; j < rounds.length; j++) {
          const round = rounds[j];
          if (round.round == 1) {
            firstRoundId = round.id
          }
        }
        for (let i = 0; i < matches.length; i++) {
          
          const match = matches[i];
          console.log(match)
          if (match.round == firstRoundId) {
            console.log("Team 1: " + ((match.team1 != null && match.team1 != "")) + " Team 2: " + match.team2)
            if ((match.team1 != null && match.team1 != "") || (match.team2 != null &&match.team2 != "")) {
              matchesSet = true
            } else {
              roundOneMatches.push(i)
            }
          }
        }
        console.log("here")
        if (!matchesSet) {
          console.log("setFirstRound")
          console.log(roundOneMatches)
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
            console.log("New match: " + match)
            const { data, error } = await supabase
              .from('matches')
              .update({ team1: match.team1, team2: match.team2 })
              .eq('id', match.id)
              .select()
          }
          linkMatches()
        }
      }
      console.log("Set: " + matchesSet)
    }

    function updateTournament(round: number) {
      let htmlRounds: JSX.Element[] = []
      let theRounds: RoundMatches[] = [];
      let numOfTeams: number = 0;
      let matchUps: Matchup[] = []
      if (matches && rounds && tournaments) {
        numOfTeams = 0
        for (let i = 0; i < rounds.length; i++) {
          const theRound = rounds[i];
          if (theRound.round == round && tournaments.id == theRound.tournament) {
            let roundMatches: Matches[] = []
            for (let j = 0; j < matches.length; j++) {
              const element = matches[j];
              if (element.round == theRound.id) {
                const topTeam = {
                  "team": element.team1,
                  "position": 0
                };
                const bottomTeam = {
                  "team": element.team2,
                  "position": 0
                };
                matchUps.push({
                  "match": element,
                  "topTeam": topTeam,
                  "bottomTeam": bottomTeam
                });
                roundMatches.push(element)
              }
            }
            let tournamentRound: RoundMatches = {
              "matches": roundMatches,
              "displayMatches": matchUps,
              "round": round-i
            }
            console.log(tournamentRound)
            setPlayTournamentHTML(<Round round={tournamentRound} key={tournamentRound.round} router={router}/>)
          }
        }
      }
    }

    const fetchTournaments = async () => {
        try {
            // Example: Fetch tournaments from an API
            // console.log(router)
            if (typeof router.query.tournament == "string") {
              const { data: data, error } = await supabase
                .from('tournaments')
                .select('*')
                .eq('id', Number(router.query.tournament))
                .order('id', { ascending: true })
              if (error || data.length != 1) console.log('error', error)
              else {
                if (!tournaments) {
                  setTournaments(data[0]);
                }
                // setTournaments(data[0]);
                fetchRounds()
              } // Update the state with fetched data
            }
        } catch (error) {
            console.error('Error fetching tournaments:', error);
        }
    };

    const fetchRounds = async () => {
        try {
            // Example: Fetch tournaments from an API
            const { data: data, error } = await supabase
                .from('rounds')
                .select('*')
                .eq('tournament', Number(router.query.tournament))
                .order('round', { ascending: true })
            if (error) console.log('error', error)
            else {
                console.log(data)
                if (!rounds) {
                  setRounds(data);
                }
                fetchMatches()
            }
        } catch (error) {
            console.error('Error fetching rounds:', error);
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
              if (error) console.log('error', error)
              else {
                console.log(data)
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
        console.log(router.query);
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
    return (
    <div>
      <NavBar></NavBar>
      <p>Tournament Name: {tournaments?.tournament_name}</p>
      <p>Round Robin: {tournaments?.round_robin}</p>
      <p>Teams: {tournaments?.teams}</p><br />
      <div>
        {playTournamentHTML}
      </div>
      <div>
        <button onClick={previousRound}>Previous</button>
        <button onClick={nextRound}>Next</button>
        <p>Round: {currentRound}</p>
      </div>
    </div>)
    }

export default TournamentPlayer;
