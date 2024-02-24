// TournamentForm.js

import { useState, useEffect } from 'react';
import { Database } from '@/types/supabase'
import { Session, User, useSupabaseClient } from '@supabase/auth-helpers-react'
import { TournamentFormProps } from '../types/form-types'; // Adjust the path based on your project structure

type Tournaments = Database['public']['Tables']['tournaments']['Row']
type Rounds = Database['public']['Tables']['rounds']['Row']
type Matches = Database['public']['Tables']['matches']['Row']

interface Round {
  teams: string[]
  tournament: number
  round: number
  owner_user_id: string
}

interface Match {
  team1: string
  team2: string
  round: number
  tournament: number
  owner_user_id: string
  match: number
}

function TournamentForm({ onSubmit, session }: TournamentFormProps) {
  const supabase = useSupabaseClient<Database>()
  const [tournamentName, setTournamentName] = useState('');
  const [roundRobin, setRoundRobin] = useState(false);
  const [teams, setTeams] = useState(['']);
  const [tournamentMatches, setTournamentMatches] = useState<Matches[]>([]);
  const [tournamentRounds, setTournamentRounds] = useState<Rounds[]>([]);
  const [finishedSetup, setFinishedSetup] = useState<boolean>(false);

  const user = session.user

  const handleTeamChange = (index: number, value: string) => {
    const newTeams = [...teams];
    newTeams[index] = value;
    setTeams(newTeams);
  };

  const handleAddTeam = () => {
    setTeams([...teams, '']);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (index === teams.length - 1) {
        handleAddTeam();
        // Focus on the newly added input field
        const newIndex = index + 1;
        const newInput = document.getElementById(`teamInput${newIndex}`);
        if (newInput) {
          newInput.focus();
        }
      }
    }
  };

  const addMatches = async (round: Rounds, teams: string[]) => {
    const { data: data, error } = await supabase
      .from('matches')
      .select('*')
      .order('id', { ascending: true })
      .eq('rounds', round.id)
      console.log("rounds data" + data)
      console.log("rounds data length" + data?.length)
    if (!data || data.length == 0) {
      let matches: Match[] = []
      let matchCount: number = 1
      for (let i = 0; i < teams.length; i=i+2) {
        console.log("match" + i)
        matches.push({ team1: "", team2: "", tournament: round.tournament, round: round.id, owner_user_id: user.id, match: matchCount })
        matchCount++;
      }
      const { data, error } = await supabase
        .from('matches')
        .insert(matches)
        .select()
      if (error) {
        console.log(error)
      }
      console.log("matches data" + data)
    }
  };

  const addRounds = async (tournament: Tournaments) => {
    const { data: data, error } = await supabase
      .from('rounds')
      .select('*')
      .order('id', { ascending: true })
      .eq('tournament', tournament.id)
      console.log("data" + data)
      console.log("data length" + data?.length)
    if (!data || data.length == 0) {
      let currentTeams = tournament.teams.length;
      let roundCount = 0;

      while (currentTeams > 1) {
        currentTeams /= 2;
        roundCount++;
      }
      console.log("round count: " + roundCount)
      let teamsRounds: string[][] = []
      // roundCount = 1;
      let count = 1;
      let rounds: Round[] = []
      for (let i = roundCount; i > 0; i--) {
        console.log(i)
        let teams: string[] = []
        for (let j = 0; j < Math.pow(2, i); j++) {
          teams.push("")
        }
        console.log({ teams: teams, tournament: tournament.id, round: count, owner_user_id: user.id })
        rounds.push({ teams: teams, tournament: tournament.id, round: count, owner_user_id: user.id })
        teamsRounds.push(teams)
        count++;
      }
      const { data, error } = await supabase
        .from('rounds')
        .insert(rounds)
        .select()
      console.log("data" + data)
      if (error) {
        console.log(error)
      }
      if (data) {
        console.log(data)
        for (let i=0; i<data.length; i++) {
          addMatches(data[i], teamsRounds[i])
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validate the form data before submitting
    if (!tournamentName || teams.some(team => team === '')) {
      alert('Please fill out all required fields');
      return;
    }
  
    // Check for duplicate team names
    const uniqueTeams = [...new Set(teams)];
    if (uniqueTeams.length !== teams.length) {
      alert('Team names must be unique');
      return;
    }
    
    const { data, error } = await supabase
    .from('tournaments')
    .insert([
      { owner_user_id: user.id, round_robin: roundRobin, tournament_name: tournamentName, teams: teams},
    ])
    .select()

    if (data) {
      console.log(data.length)
      for (let i=0; i<data.length; i++) {
        addRounds(data[i])
      }
    }

    // Call the onSubmit function with the form data
    onSubmit({
      tournamentName,
      roundRobin,
      teams: uniqueTeams, // Use uniqueTeams to eliminate duplicates
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-6">Tournament Form</h2>

        <div className="mb-4">
          <label htmlFor="tournamentName" className="block text-sm font-medium text-gray-700">
            Tournament Name:
          </label>
          <input
            type="text"
            id="tournamentName"
            className="mt-1 p-2 w-full border rounded-md"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              className="mr-2"
              checked={roundRobin}
              onChange={() => setRoundRobin(!roundRobin)}
            />
            Round Robin
          </label>
        </div>

        <div className="mb-4">
          <label htmlFor="teams" className="block text-sm font-medium text-gray-700">
            Teams:
          </label>

          {teams.map((team, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                id={`teamInput${index}`}
                className="p-2 border rounded-md flex-grow mr-2"
                placeholder={`Team ${index + 1}`}
                value={team}
                onChange={(e) => handleTeamChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            </div>
          ))}

          <button
            type="button"
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue active:bg-blue-800 mt-2"
            onClick={handleAddTeam}
          >
            Add Team
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 focus:outline-none focus:shadow-outline-green active:bg-green-800"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default TournamentForm;
