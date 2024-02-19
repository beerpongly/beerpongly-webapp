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
    const [addTournament, setAddTournament] = useState(false);
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

    function onPlay() {
      console.log("rats")
    }

    function setFirstRound() {
      let matchesSet: boolean = false
      if (matches && tournaments && rounds) {
        for (let i = 0; i < matches.length; i++) {
          const match = matches[i];
          console.log("Team 1: " + match.team1 + " Team 2: " + match.team2)
          if ((match.team1 != null && match.team1 != "") || (match.team2 != null && match.team2 != "")) {
            matchesSet = true
          }
        }
        if (!matchesSet ) {
          console.log("setFirstRound")
          console.log(matches)
          console.log(tournaments)
          for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            
          }
        }
      }
      console.log("Set: " + matchesSet)
    }

    function updateTournament(round: number) {
      let htmlRounds: JSX.Element[] = []
      let theRounds: RoundMatches[] = [];
      // console.log(tournaments)
      let numOfTeams: number = 0;
      let matchups: Matchup[] = []
      if (matches && rounds && tournaments) {
        numOfTeams = 0
        for (let i = 0; i < rounds.length; i++) {
          const theRound = rounds[i];
          if (theRound.round == round && tournaments.id == theRound.tournament) {
            for (let j = 0; j < matches.length; j++) {
              const element = matches[j];
              if (element.round == theRound.id) {
                const topTeam = {
                  "team": "",
                  "position": 0
                };
                const bottomTeam = {
                  "team": "",
                  "position": 0
                };
                matchups.push({
                  "match": undefined,
                  "topTeam": topTeam,
                  "bottomTeam": bottomTeam
                });
              }
            }
            let finalRound: RoundMatches = {
              "matches": [],
              "displayMatches": matchups,
              "round": round-i
            }
            setPlayTournamentHTML(<Round onPlay={() => onPlay()} round={finalRound} key={finalRound.round}/>)
          }
        }
      }
      // console.log(numOfTeams)
      // setPlayTournamentHTML()
      // setPlayTournamentHTML(<PlayTournament id={tournaments.id} tournament_name={tournaments.tournament_name} round_robin={tournaments.round_robin} teams={tournaments.teams}></PlayTournament>)

      // let roundCount = getRoundCount(numOfTeams)
      // console.log(roundCount)

      // let matchesCount = 1
      // for (let i = 0; i < roundCount; i++) {
      //   let matchups: Matchup[] = []
      //   // for (let j = 1; j <= matchesCount; j++) {
      //   //   const topTeam = {
      //   //     "team": "",
      //   //     "position": 0
      //   //   };
      //   //   const bottomTeam = {
      //   //     "team": "",
      //   //     "position": 0
      //   //   };
      //   //   matchups.push({
      //   //     "match": undefined,
      //   //     "topTeam": topTeam,
      //   //     "bottomTeam": bottomTeam
      //   //   });
      //   // }
      //   // theRounds.unshift({
      //   //   "matches": [],
      //   //   "displayMatches": matchups,
      //   //   "round": roundCount-i
      //   // })
      //   matchesCount = matchesCount + matchesCount
      // }
      // console.log(rounds)
      // for (let index = 0; index < theRounds.length; index++) {
      //   htmlRounds.push(<Round onPlay={() => onPlay()} round={theRounds[index]} key={index}/>);
      // }

      // setPlayTournamentHTML(<Round onPlay={() => onPlay()} round={theRounds} key={index}/>)
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
                .order('id', { ascending: true })
            if (error) console.log('error', error)
            else {
                console.log(data)
                if (!rounds) {
                  setRounds(data);
                }
                fetchMatches()
            } // Update the state with fetched data
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
                } // setTournaments(data[0]);
                // fetchRounds()
              } // Update the state with fetched data
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
