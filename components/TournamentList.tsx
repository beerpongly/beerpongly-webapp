import { Database } from '@/types/supabase'
import { Session, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

type Tournaments = Database['public']['Tables']['tournaments']['Row']

interface AddTournament {
  round_robin: boolean
  teams: string[]
  tournament_name: string
}

export default function TournamentList({ session }: { session: Session }) {
  let defaultTournament: AddTournament = {
    round_robin: false,
    teams: [],
    tournament_name: ''
  }
  const supabase = useSupabaseClient<Database>()
  const [tournaments, setTournaments] = useState<Tournaments[]>([])
  const [newTournament, setNewTournament] = useState(defaultTournament)
  const [errorText, setErrorText] = useState('')

  const user = session.user

  useEffect(() => {
    const fetchTournaments = async () => {
      const { data: tournaments, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('id', { ascending: true })

      if (error) console.log('error', error)
      else setTournaments(tournaments)
    }

    fetchTournaments()
  }, [supabase])

  const addTournament = async (
    newTournament: AddTournament,
  ) => {
    let round_robin = newTournament.round_robin
    let teams = newTournament.teams
    let tournament_name = newTournament.tournament_name.trim()
    if (round_robin && teams && tournament_name) { // TODO add conditions
      const { data: tournament, error } = await supabase
        .from('tournaments')
        .insert({ round_robin: round_robin, teams: teams, tournament_name: tournament_name, owner_user_id: user.id })
        .select()
        .single()

      if (error) {
        setErrorText(error.message)
      } else {
        setTournaments([...tournaments, tournament])
        setNewTournament(defaultTournament)
      }
    }
  }

  const deleteTournament = async (id: number) => {
    try {
      await supabase.from('tournaments').delete().eq('id', id).throwOnError()
      setTournaments(tournaments.filter((x) => x.id != id))
    } catch (error) {
      console.log('error', error)
    }
  }

  return (
    <div className="w-full">
      <h1 className="mb-12">Tournament List.</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          addTournament(newTournament)
        }}
        className="flex gap-2 my-2"
      >
        <input
          className="rounded w-full p-2"
          type="text"
          placeholder="make coffee"
          value={newTournament.tournament_name}
          onChange={(e) => {
            setErrorText('')
            setNewTournament(e.target.value)
          }}
        />
        <button className="btn-black" type="submit">
          Add
        </button>
      </form>
      {!!errorText && <Alert text={errorText} />}
      <div className="bg-white shadow overflow-hidden rounded-md">
        <ul>
          {tournaments.map((tournament) => (
            <Tournament key={tournament.id} tournament={tournament} onDelete={() => deleteTournament(tournament.id)} />
          ))}
        </ul>
      </div>
    </div>
  )
}

const Tournament = ({ tournament, onDelete }: { tournament: Tournaments; onDelete: () => void }) => {
  const supabase = useSupabaseClient<Database>()
  const [isCompleted, setIsCompleted] = useState(tournament.is_complete)

  const toggle = async () => {
    try {
      const { data } = await supabase
        .from('tournaments')
        .update({ is_complete: !isCompleted })
        .eq('id', tournament.id)
        .throwOnError()
        .select()
        .single()

      if (data) setIsCompleted(data.is_complete)
    } catch (error) {
      console.log('error', error)
    }
  }

  return (
    <li className="w-full block cursor-pointer hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition duration-150 ease-in-out">
      <div className="flex items-center px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1 flex items-center">
          <div className="text-sm leading-5 font-medium truncate">{tournament.task}</div>
        </div>
        <div>
          <input
            className="cursor-pointer"
            onChange={(e) => toggle()}
            type="checkbox"
            checked={isCompleted ? true : false}
          />
        </div>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete()
          }}
          className="w-4 h-4 ml-2 border-2 hover:border-black rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="gray">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </li>
  )
}

const Alert = ({ text }: { text: string }) => (
  <div className="rounded-md bg-red-100 p-4 my-3">
    <div className="text-sm leading-5 text-red-700">{text}</div>
  </div>
)
