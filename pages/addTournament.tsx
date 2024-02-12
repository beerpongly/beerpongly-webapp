import { useSession } from '@supabase/auth-helpers-react'
import { TournamentFormProps } from '../types/form-types'; // Adjust the path based on your project structure
import TournamentForm from '@/components/CreateTournament';
import NavBar from '@/components/navbar';
import { useRouter } from 'next/navigation';


function AddTournament() {
  const session = useSession()
  const router = useRouter();

  if (session) {
    const addTournamentSubmit: TournamentFormProps['onSubmit'] = (formData) => {
      // Handle the form data (e.g., send it to an API, save it to state, etc.)
      console.log(formData);
      router.push("/tournaments")
    };

    return (
      <div>
        <NavBar></NavBar>
        <div>
          <TournamentForm onSubmit={addTournamentSubmit} session={session} />
        </div>
      </div>
    );
  }
  else {
    return (<div></div>)
  }
}

export default AddTournament;
