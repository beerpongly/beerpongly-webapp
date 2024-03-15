import { useSession } from '@supabase/auth-helpers-react'
import { TournamentFormProps } from '../types/form-types'; // Adjust the path based on your project structure
import TournamentForm from '@/components/CreateTournament';
import NavBar from '@/components/navbar';
import { useRouter } from 'next/navigation';


function AddTournament() {
  const session = useSession()
  const router = useRouter();

  if (session) {

    return (
      <div className='w-full h-full bg-white dark:bg-gray-900 text-center'>
        <NavBar></NavBar>
        <div className='w-full h-full bg-white dark:bg-gray-900 text-center'>
          <TournamentForm session={session} />
        </div>
      </div>
    );
  }
  else {
    return (<div></div>)
  }
}

export default AddTournament;
