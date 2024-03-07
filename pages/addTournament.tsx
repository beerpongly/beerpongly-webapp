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
      <div>
        <NavBar></NavBar>
        <div>
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
