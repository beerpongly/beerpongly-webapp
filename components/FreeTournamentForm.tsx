// TournamentForm.js

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function FreeTournamentForm() {
  const router = useRouter();
  const [teams, setTeams] = useState(['']);
  const [errorMessage, setErrorMessage] = useState(<div></div>)

  const handleTeamChange = (index: number, value: string) => {
    const newTeams = [...teams];
    newTeams[index] = value;
    setTeams(newTeams);
  };

  const handleAddTeam = () => {
    if (teams.length < 16) {
      setTeams([...teams, '']);
    }
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

  const handleDeleteTeam = (index: number) => {
    if (index < teams.length && teams.length > 1) {
      const newTeams = [...teams];
      newTeams.splice(index, 1);
      setTeams(newTeams);
    }
  };

  const addRounds = async () => {
    let currentTeams = teams.length;
    let roundCount = 0;
    while (currentTeams > 1) {
      currentTeams /= 2;
      roundCount++;
    }

    let rounds: string[][] = []
    for (let i = roundCount; i >= 0; i--) {
      let teams: string[] = []
      for (let j = 0; j < Math.pow(2, i); j++) {
        teams.push("")
      }
      rounds.push(teams)
    }

    localStorage.setItem("rounds", JSON.stringify(rounds))
    localStorage.setItem("winners", JSON.stringify(rounds))
  };

  const AddTournament = async () => {
    localStorage.setItem("teams", JSON.stringify(teams))
    addRounds();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(<div></div>);
  
    // Validate the form data before submitting
    if (teams.some(team => team === '')) {
      setErrorMessage(<div className='font-bold text-red-500'>Please fill out all required Teams!</div>);
      return;
    }

    // Check for duplicate team names
    const uniqueTeams = [...new Set(teams)];
    if (uniqueTeams.length !== teams.length) {
      setErrorMessage(<div className='font-bold text-red-500'>Team names must be unique!</div>);
      return;
    }

    AddTournament()

    router.push("/freeEdit")
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-6">Create Tournament</h2>

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
              <button
                type="button"
                className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                onClick={() => handleDeleteTeam(index)}
              >
                Delete Team
              </button>
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
        <div>
          {errorMessage}
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

export default FreeTournamentForm;
