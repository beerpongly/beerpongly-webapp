
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
  }
  
  export function Match({ match }: Matchup) {
    console.log("match match: " + match)
    return (
      <main className="p-20">
        <div className="">
          {/* <TopBracket team={topTeam} position={topTeam}/> */}
          <div className="flex justify-start">
            <div className="box-border h-10 w-10 p-1 border-gray-400 bg-indigo-300 rounded-tl-lg text-center">
              <p className="inline-block align-middle">{0}</p>
            </div>
              <div className="box-border h-10 w-40 p-1 border-gray-400 bg-indigo-200 rounded-tr-lg">
                <p className={`inline-block align-middle ${!match?.winner ? 'line-through' : ''}`}>{match.team1}</p>
              </div>
            </div>
          {/* <BottomBracket team={bottomTeam} position={bottomTeam}/> */}
          <div className="flex justify-start box-border border-gray-400 max-w-50">
            <div className="box-border h-10 w-10 p-1 border-indigo-300 border-t-2 bg-indigo-300 rounded-bl-lg text-center">
              <p className="inline-block align-middle">{0}</p>
            </div>
            <div className="box-border h-10 w-40 p-1 border-indigo-300 border-t-2 bg-indigo-200 rounded-br-lg">
              <p className={`inline-block align-middle ${match?.winner ? 'line-through' : ''}`}>{match.team2}</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  function onPlay(tournamentId: number, matchId: number, router: NextRouter) {
    console.log("/tournaments/" + String(tournamentId) + "/" + String(matchId))
    router.push("/tournaments/" + String(tournamentId) + "/" + String(matchId))
  }
  
 export function Round({round, router}: Games) {
    let matches = []
    for (let index = 0; index < round.matches.length; index++) {
      console.log("round: " + index)
      const match = round.matches[index];
      const tournamentId = round.matches[index].tournament
      const matchId = round.matches[index].id
      matches.push(
      <div onClick={() => onPlay(tournamentId, matchId, router)}>
        <Match key={index} match={match}/>
      </div>
      );
    }
  
    return (
      <div>
        {matches}
      </div>
    )
  }
