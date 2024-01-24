
import { Database } from '@/types/supabase'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { TournamentFormProps } from '../types/form-types'; // Adjust the path based on your project structure
import TournamentForm from '@/components/CreateTournament';
import NavBar from '@/components/navbar';

export interface Tournament {
    id: number;
    tournament_name: string;
    round_robin: boolean;
    teams: string[];
  }

  export interface BracketTeam {
    team: string;
    position: number;
    onAddWinningTeam: () => void;
  }
  
  export interface Matchup {
    topTeam: BracketTeam;
    bottomTeam: BracketTeam;
  }
  
  export interface RoundMatches {
    teams: Matchup[]
    round: number
  }
  
  export interface Games {
    round: RoundMatches
  }
  
  export function TopBracket({ team, position, onAddWinningTeam }: BracketTeam) {
    return (
      <div className="flex justify-start">
        <div className="box-border h-10 w-10 p-1 border-gray-400 bg-indigo-300 rounded-tl-lg text-center">
          <p className="inline-block align-middle">{position}</p>
        </div>
        <div className="box-border h-10 w-40 p-1 border-gray-400 bg-indigo-200 rounded-tr-lg">
          <p className="inline-block align-middle" onClick={onAddWinningTeam}>{team}</p>
        </div>
      </div>
    )
  }
  
  export function BottomBracket({ team, position, onAddWinningTeam }: BracketTeam) {
    return (
      <div className="flex justify-start box-border border-gray-400 max-w-50">
        <div className="box-border h-10 w-10 p-1 border-indigo-300 border-t-2 bg-indigo-300 rounded-bl-lg text-center">
          <p className="inline-block align-middle">{position}</p>
        </div>
        <div className="box-border h-10 w-40 p-1 border-indigo-300 border-t-2 bg-indigo-200 rounded-br-lg">
          <p className="inline-block align-middle" onClick={onAddWinningTeam}>{team}</p>
        </div>
      </div>
    )
  }
  
  export function Match({ topTeam, bottomTeam }: Matchup) {
    return (
      <main className="p-20">
        <div className="">
          <TopBracket team={topTeam.team} position={topTeam.position} onAddWinningTeam={topTeam.onAddWinningTeam}/>
          <BottomBracket team={bottomTeam.team} position={bottomTeam.position} onAddWinningTeam={bottomTeam.onAddWinningTeam}/>
        </div>
      </main>
    )
  }
  
 export function Round({round}: Games) {
    let matches = []
  
    for (let index = 0; index < round.teams.length; index++) {
      const element = round.teams[index];
      matches.push(<Match topTeam={element.topTeam} bottomTeam={element.bottomTeam} key={index}/>);
    }
  
    return (
      <div>
        {matches}
      </div>
    )
  }
  
  export function PlayTournament({id, tournament_name, round_robin, teams}: Tournament) {
    // let teams: string[] = [
    //   "Team 1",
    //   "Team 2",
    //   "Team 3",
    //   "Team 4",
    //   "Team 5",
    //   "Team 6",
    //   "Team 7",
    //   "Team 8",
    // ];
    let count = 1;
    let rounds: RoundMatches[] = [];
    let roundCount = 0
    for (let i = 1; i < teams.length; i=i*2) {
      roundCount++;
    }
    for (let i = 0; count < teams.length; i++) {
      rounds.push({
        "teams": [],
        "round": i
      })
      count *= 2
    }
    let htmlRounds: JSX.Element[] = []
    const [currentRounds, setCurrentRounds] = useState(htmlRounds);
  
    function winner(team: BracketTeam) {
      alert("Congratulations! " + team.team + " is the winner.");
    }
  
    function nextRound(round: number, team: BracketTeam, gameIndex: number) {
      round = round + 1;
      if (round == roundCount) {
        winner(team);
      } else {
        if (gameIndex % 2 == 0) {
          rounds[round].teams[Math.floor(gameIndex/2)].topTeam.team = team.team;
          rounds[round].teams[Math.floor(gameIndex/2)].topTeam.position = team.position;
          rounds[round].teams[Math.floor(gameIndex/2)].topTeam.onAddWinningTeam = () => nextRound(round, team, Math.floor(gameIndex/2));
        } else {
          rounds[round].teams[Math.floor(gameIndex/2)].bottomTeam.team = team.team;
          rounds[round].teams[Math.floor(gameIndex/2)].bottomTeam.position = team.position;
          rounds[round].teams[Math.floor(gameIndex/2)].bottomTeam.onAddWinningTeam = () => nextRound(round, team, Math.floor(gameIndex/2));
        }
  
        htmlRounds = [];
        for (let index = 0; index < rounds.length; index++) {
          htmlRounds.push(<Round round={rounds[index]} key={index}/>);
        }
        setCurrentRounds(htmlRounds);
      }
      
    }
  
    let numOfTeams: number = teams.length;
    for (let j = 0; j < roundCount; j++) {
      for (let i = 0; i < numOfTeams; i=i+2) {
        const topTeam = {
          "team": "",
          "position": 0,
          "onAddWinningTeam": () => nextRound
        };
        const bottomTeam = {
          "team": "",
          "position": 0,
          "onAddWinningTeam": () => nextRound
        };
        rounds[j].teams.push({
          "topTeam": topTeam,
          "bottomTeam": bottomTeam
        });
      }
      numOfTeams = Math.ceil(numOfTeams/2)
    }
  
    count = 0
    for (let i = 0; i < teams.length; i++) {
      let topTeam = {
        "team": teams[i],
        "position": i + 1,
        "onAddWinningTeam": () => nextRound(0, topTeam, Math.floor(i/2))
      }
  
      rounds[0].teams[count].topTeam = topTeam;
      i++
  
      let bottomTeam: BracketTeam
      if (i < teams.length) {
        bottomTeam = {
          "team": teams[i],
          "position": i + 1,
          "onAddWinningTeam": () => nextRound(0, bottomTeam, Math.floor(i/2))
        }
      } else {
        bottomTeam = {
          "team": "pass",
          "position": 0,
          "onAddWinningTeam": () => nextRound(0, bottomTeam, Math.floor(i/2))
        }
      }
  
      rounds[0].teams[count].bottomTeam = bottomTeam;
      count++;
    }
    for (let index = 0; index < rounds.length; index++) {
      htmlRounds.push(<Round round={rounds[index]} key={index}/>);
    }
  
    return (
      <div className="grid grid-cols-3">
        {currentRounds}
      </div>
    )
  }