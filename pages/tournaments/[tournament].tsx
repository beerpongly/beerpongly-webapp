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
    const [rounds, setRounds] = useState<Rounds>()
    const [matches, setMatches] = useState<Matches>()
    const [playTournamentHTML, setPlayTournamentHTML] = useState(<div></div>)
    const [addTournament, setAddTournament] = useState(false);
    const router = useRouter();
    console.log(router.asPath)

    function updateTournament() {
      let htmlRounds: JSX.Element[] = []
      let rounds: RoundMatches[] = [];
      // console.log(tournaments)
      let numOfTeams: number = 0;
      if (tournaments) {
        numOfTeams = tournaments.teams.length
      }
      
      // console.log(numOfTeams)
      // setPlayTournamentHTML()
      // setPlayTournamentHTML(<PlayTournament id={tournaments.id} tournament_name={tournaments.tournament_name} round_robin={tournaments.round_robin} teams={tournaments.teams}></PlayTournament>)

      let roundCount = 0;
      let currentTeams = numOfTeams;

      while (currentTeams > 1) {
        currentTeams /= 2;
        roundCount++;
      }
      console.log(roundCount)

      let matchesCount = 1
      for (let i = 0; i < roundCount; i++) {
        let matchups: Matchup[] = []
        for (let j = 1; j <= matchesCount; j++) {
          const topTeam = {
            "team": "",
            "position": 0
          };
          const bottomTeam = {
            "team": "",
            "position": 0
          };
          matchups.push({
            "topTeam": topTeam,
            "bottomTeam": bottomTeam
          });
          
        }
        rounds.unshift({
          "teams": matchups,
          "round": roundCount-i
        })
        matchesCount = matchesCount + matchesCount
        console.log(matchups)
      }
      console.log(rounds)
      for (let index = 0; index < rounds.length; index++) {
        htmlRounds.push(<Round round={rounds[index]} key={index}/>);
      }

      setPlayTournamentHTML(htmlRounds[0])
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
                  setRounds(data[0]);
                }
                fetchMatches()
            } // Update the state with fetched data
        } catch (error) {
            console.error('Error fetching rounds:', error);
        }
    };

    const fetchMatches = async () => {
        try {
            // Example: Fetch tournaments from an API
            // console.log(router)
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
                  setMatches(data[0])
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
        // Code using query
        // console.log(router.query);
        // this will set the state before component is mounted
        updateTournament();
      }
    // }, []);
    }, [tournaments]);

    useEffect(() => {
      if (router.isReady) {
        // Code using query
        console.log(router.query);
        // this will set the state before component is mounted
        fetchTournaments();
      }
    }, [router.isReady]);
    // console.log(playTournamentHTML);
    // fetchTournaments();
    return (
    <div>
      <p>Tournament Name: {tournaments?.tournament_name}</p>
      <p>Round Robin: {tournaments?.round_robin}</p>
      <p>Teams: {tournaments?.teams}</p><br />
      <div>
        {playTournamentHTML}
      </div>
    </div>)
    }

export default TournamentPlayer;
