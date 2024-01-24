import { useRouter } from 'next/router'

// TournamentViewer.tsx

import { Database } from '@/types/supabase'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { TournamentFormProps } from '../../types/form-types'; // Adjust the path based on your project structure
import { BracketTeam, Matchup, Round, RoundMatches, Tournament } from '@/components/tournamentBrackets';
import NavBar from '@/components/navbar';

type Tournaments = Database['public']['Tables']['tournaments']['Row']
type Rounds = Database['public']['Tables']['rounds']['Row']

interface TournamentViewerProps {
  // No need to pass tournaments as a prop, since it will be fetched internally
}

function PlayTournament({id, tournament_name, round_robin, teams}: Tournament) {
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

function nextRound(round: number, team: BracketTeam, gameIndex: number) {}

function TournamentViewer() {
    const initialTournamentData: Tournament = {
      id: 0,
      tournament_name: "",
      round_robin: false,
      teams: ["team 1", "team 2"]
    }
    const supabase = useSupabaseClient<Database>()
    const session = useSession()
    const [tournaments, setTournaments] = useState<Tournament>(initialTournamentData)
    const [playTournamentHTML, setPlayTournamentHTML] = useState<JSX.Element>(<div></div>)
    const [addTournament, setAddTournament] = useState(false);
    const router = useRouter();

    function updateTournament() {
      let htmlRounds: JSX.Element[] = []
      let rounds: RoundMatches[] = [];
      // console.log(tournaments)
      const numOfTeams: number = tournaments.teams.length
      // console.log(numOfTeams)
      setPlayTournamentHTML(<div></div>)
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
            "position": 0,
            "onAddWinningTeam": () => nextRound
          };
          const bottomTeam = {
            "team": "",
            "position": 0,
            "onAddWinningTeam": () => nextRound
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

      setPlayTournamentHTML(htmlRounds)
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

              // console.log(data)
                
              if (error) console.log('error', error)
              else {
                const tournamentData: Tournament = {
                  id: 0,
                  tournament_name: "",
                  round_robin: false,
                  teams: []
                }
                if (data[0].tournament_name) {tournamentData.tournament_name = data[0].tournament_name}
                if (data[0].round_robin) {tournamentData.round_robin = data[0].round_robin}
                if (data[0].teams) {tournamentData.teams = data[0].teams}
                console.log(tournamentData)
                setTournaments(tournamentData);
              } // Update the state with fetched data
            }
        } catch (error) {
            console.error('Error fetching tournaments:', error);
        }
    };

    useEffect(() => {
      if (router.isReady) {
        // Code using query
        // console.log(router.query);
        // this will set the state before component is mounted
        updateTournament();
      }
    }, [tournaments]);

    useEffect(() => {
      if (router.isReady) {
        // Code using query
        // console.log(router.query);
        // this will set the state before component is mounted
        fetchTournaments();
      }
    }, [router.isReady]);
    // console.log(playTournamentHTML);
    return (
    <div>
      <p>Tournament Name: {tournaments.tournament_name}</p>
      <p>Round Robin: {tournaments.round_robin}</p>
      <p>Teams: {tournaments.teams}</p><br />
      <div>
        {playTournamentHTML}
      </div>
    </div>)
    }

export default TournamentViewer;
