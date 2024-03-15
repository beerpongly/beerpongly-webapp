
import { Database } from '@/types/supabase'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { TournamentFormProps } from '../types/form-types'; // Adjust the path based on your project structure
import TournamentForm from '@/components/CreateTournament';
import NavBar from '@/components/navbar';
import { useRouter, NextRouter } from 'next/router'

type Tournaments = Database['public']['Tables']['tournaments']['Row']
type Matches = Database['public']['Tables']['matches']['Row']

export interface Tournament {
    id: number;
    tournament_name: string;
    round_robin: boolean;
    teams: string[];
  }

  export interface Matchup {
    match: Matches
  }

  export interface RoundMatches {
    matches: Matches[]
    // displayMatches: Matchup[]
    round: number
  }

  export interface Games {
    round: RoundMatches
    router: NextRouter;
    tournament: Tournaments
  }
  
  export function Match({ match }: Matchup) {
    console.log("match match: " + match)
    return (
      <main className="">
        <div className="text-center border-t-2 rounded-lg text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
          {/* <TopBracket team={topTeam} position={topTeam}/> */}
          <div className="flex justify-start">
            <div className="box-border h-10 w-10 p-1 border-r-2 rounded-tl-lg">
              <p className="inline-block align-middle">{0}</p>
            </div>
{/* // text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white */}
            <div className="box-border h-10 w-40 p-1 rounded-tr-lg">
              <p className={`inline-block align-middle ${match?.winner == false ? 'line-through' : ''}`}>{match.team1}</p>
            </div>
          </div>
          {/* <BottomBracket team={bottomTeam} position={bottomTeam}/> */}
          <div className="flex justify-start box-border border-gray-400 max-w-50">
            <div className="box-border h-10 w-10 p-1 border-t-2 border-r-2 rounded-bl-lg">
              <p className="inline-block align-middle">{0}</p>
            </div>
            <div className="box-border h-10 w-40 p-1 border-t-2 rounded-br-lg">
              <p className={`inline-block align-middle ${match?.winner == true ? 'line-through' : ''}`}>{match.team2}</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  function onPlay(tournament: Tournaments, match: Matches, router: NextRouter) {
    console.log("/tournaments/" + String(tournament.id) + "/" + String(match.id))
    if (tournament.progress >= match.round) {
      router.push("/tournaments/" + String(tournament.id) + "/" + String(match.id))
    } else {
      console.log("Cannot play future rounds!")
    }
  }
  
 export function Round({round, router, tournament}: Games) {
    let matches = []
    for (let index = 0; index < round.matches.length; index++) {
      console.log("round: " + index)
      const match = round.matches[index];
      const matchId = round.matches[index].id
      matches.push(
      <div onClick={() => onPlay(tournament, round.matches[index], router)}>
        <Match key={index} match={match}/>
      </div>
      );
    }
  
    return (
      <div className='grid grid-cols-1 gap-4'>
        {matches}
      </div>
    )
  }
