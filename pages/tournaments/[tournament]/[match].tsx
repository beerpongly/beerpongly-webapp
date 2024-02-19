import { useRouter } from 'next/router'
import { Database } from '@/types/supabase'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import NavBar from '@/components/navbar';

type Tournaments = Database['public']['Tables']['tournaments']['Row']
type Rounds = Database['public']['Tables']['rounds']['Row']
type Matches = Database['public']['Tables']['matches']['Row']

function TournamentPlayer() {
    const supabase = useSupabaseClient<Database>()
    const session = useSession()
    const [match, setMatch] = useState<Matches>()
    const router = useRouter();
    console.log(router.asPath)

    const fetchMatch = async () => {
        // TODO return to tournament if match id and tournament id in match dont match
        try {
            if (typeof router.query.tournament == "string" && typeof router.query.match == "string") {
              const { data: data, error } = await supabase
                .from('matches')
                .select('*')
                .eq('tournament', Number(router.query.tournament))
                .eq('id', Number(router.query.match))
              if (error) console.log('error', error)
              else {
                console.log(data)
                if (!match && data.length == 1) {
                  setMatch(data[0])
                }
              }
            }
        } catch (error) {
            console.error('Error fetching matches:', error);
        }
    };

    useEffect(() => {
      if (router.isReady) {
        console.log(router.query);
        fetchMatch();
      }
    }, [router.isReady]);

    return (
    <div>
        <NavBar></NavBar>
        <p>Tournament Name: {match?.tournament}</p>
        <p>Round: {match?.round}</p>
        <p>Teams: {match?.team1}</p>
        <p>Teams: {match?.team2}</p>
        <br />
    </div>)
    }

export default TournamentPlayer;
