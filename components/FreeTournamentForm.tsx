// TournamentForm.js

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus } from 'react-icons/fa';

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
    // <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Create Tournament</h2>

        <div className="mb-5">
          <label htmlFor="teams" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Teams:
          </label>

          {teams.map((team, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                id={`teamInput${index}`}
                className="bg-gray-50 h-10 mr-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder={`Team ${index + 1}`}
                value={team}
                onChange={(e) => handleTeamChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
              <button
                type="button"
                className="text-white h-10 bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                onClick={() => handleDeleteTeam(index)}
              >
                Delete
              </button>
            </div>
          ))}
          <button
            type="button"
            className="flex text-center items-center h-10 mr-2 text-gray-900 text-sm rounded-lg block w-full p-2.5"
            onClick={handleAddTeam}
          >
            <FaPlus className='flex text-center'/>
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 rounded-md group-hover:bg-opacity-0">
              Add Team
            </span>
          </button>
        </div>
        <div>
          {errorMessage}
        </div>
        <div className="flex">
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
              Start
          </button>
        </div>
      </form>
    // </div>
  );
};

export default FreeTournamentForm;
