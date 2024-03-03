import { useRouter } from 'next/router'
import { Database } from '@/types/supabase'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { Tournament } from '@/components/tournamentBrackets';
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
    const [finalMatch, setFinalMatch] = useState<string>();
    const router = useRouter();
    const [currentRound, setCurrentRound] = useState(1)

    async function findWinner() {
      if (matches && tournaments) {
        let theFinalMatch: Matches | undefined
        let round: number = 0
        for (let i = 0; i < matches.length; i++) {
          const match = matches[i];
          if (match.round > round) {
            theFinalMatch = match
            round = match.round
          }
        }
        if (theFinalMatch?.winner == true) {
            setFinalMatch(theFinalMatch.team1);
        } else if (theFinalMatch?.winner == false) {
            setFinalMatch(theFinalMatch.team2);
        } else {
            router.push("/tournaments/" + String(tournaments.id))
        }
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
        findWinner();
      }
    }, [matches]);

    useEffect(() => {
      if (router.isReady) {
        fetchTournaments();
      }
    }, [router.isReady]);

    return (
    <div>
      <NavBar></NavBar>
      <div>
        <p>Winner: {finalMatch}</p>
      </div>
    </div>)
    }

export default TournamentPlayer;
