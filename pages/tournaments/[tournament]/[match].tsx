import { useRouter } from 'next/router'
import { Database } from '@/types/supabase'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import NavBar from '@/components/navbar';

type Tournaments = Database['public']['Tables']['tournaments']['Row']
type Matches = Database['public']['Tables']['matches']['Row']

function TournamentPlayer() {
    const supabase = useSupabaseClient<Database>()
    const [match, setMatch] = useState<Matches>()
    const router = useRouter();
    console.log(router.asPath)

    const updateProgress = async (tournament: Tournaments) => {
      console.log(match)
      console.log(tournament.progress)
      if (match && match.round == tournament.progress) {
          console.log(match.team1 + " Wins!")
        console.log("test")
          const { data: data, error } = await supabase
          .from('matches')
          .select('*')
          .eq('tournament', tournament.id)
          .eq('round', tournament.progress)
        if (error) {
          console.log('error', error)
        }
        if (data) {
          let nextRound = true
          for (let i = 0; i < data.length; i++) {
            const match = data[i];
            if (match.winner == null) {
              nextRound = false
            }
          }
          console.log("test")
          if (nextRound && data.length > 0) {
            const { data: nextRoundData, error: nextRoundError } = await supabase
              .from('matches')
              .select('*')
              .eq('tournament', tournament.id)
              .eq('round', tournament.progress + 1)
            if (nextRoundData && nextRoundData.length == 0) {
              const { error } = await supabase
                .from('tournaments')
                .update({ progress: -1 })
                .eq('id', tournament.id)
                .select()
              if (error) {
                console.log('error', error)
              }
              router.push({
                pathname: '/tournaments/' + match.tournament + "/winner",
              })
            } else {
              const { error } = await supabase
                .from('tournaments')
                .update({ progress: tournament.progress + 1 })
                .eq('id', tournament.id)
                .select()
              if (error) {
                console.log('error', error)
              }
              console.log("test")
              router.push({
                pathname: '/tournaments/' + match.tournament,
                query: {round: match.round + 1}
              })
            }
            
          } else {
            router.push({
              pathname: '/tournaments/' + match.tournament,
              query: {round: match.round}
            })
          }
        }
      } else if (match && match.round < tournament.progress) {
        router.push({
          pathname: '/tournaments/' + match.tournament,
          query: {round: match.round}
        })
      }
    }

    const processWinner = async (winner: boolean) => {
      if (match) {
        if (winner) {
          console.log(match.team1 + " Wins!")
          const {} = await supabase
            .from('matches')
            .update({ "winner": true })
            .eq('id', match.id)
            .select()
          if (match.next_match) {
            if (match.match % 2 == 1) {
              const {} = await supabase
                .from('matches')
                .update({ "team1": match.team1 })
                .eq('id', match.next_match)
                .select()
            } else {
              const {} = await supabase
                .from('matches')
                .update({ "team2": match.team1 })
                .eq('id', match.next_match)
                .select()
            }
          }
        } else {
          console.log(match.team2 + " Wins!")
          const {} = await supabase
            .from('matches')
            .update({ "winner": false })
            .eq('id', match.id)
            .select()
          if (match.next_match) {
            if (match.match % 2 == 1) {
              const {} = await supabase
                .from('matches')
                .update({ "team1": match.team2 })
                .eq('id', match.next_match)
                .select()
            } else {
              const {} = await supabase
                .from('matches')
                .update({ "team2": match.team2 })
                .eq('id', match.next_match)
                .select()
            }
          }
        }
        const { data: data, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', Number(router.query.tournament))
        if (error) {
          console.log('error', error)
        }
        if (data?.length == 1) {
          console.log(data)
          console.log("test")
          updateProgress(data[0]);
        } else {
          router.push({
            pathname: '/tournaments/' + match.tournament,
            query: {round: match.round}
          })
        }
        
      }
    }

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
      <>
      <NavBar></NavBar>
      <section className="w-full h-full bg-white dark:bg-gray-900 text-center">
          <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white">Tournament Name: {match?.tournament}</h1>
          <p className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Round: {match?.round}</p>
          <p className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Teams: {match?.team1}</p>
          <button onClick={() =>processWinner(true)} className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
            {match?.team1} Wins!
          </button>
          <p className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Teams: {match?.team2}</p>
          <button onClick={() =>processWinner(false)} className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
            {match?.team2} Wins!
          </button> 
          <br />
      </section>
      </>
    )
  }

export default TournamentPlayer;
