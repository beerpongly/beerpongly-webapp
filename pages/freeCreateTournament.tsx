import { Footer } from '@/components/Footer';
import FreeTournamentForm from '@/components/FreeTournamentForm';
import NavBar from '@/components/navbar';


function AddTournament() {
    return (
        <div className='w-full h-full bg-white dark:bg-gray-900 text-center'>
            <NavBar></NavBar>
            <div className='w-full h-full bg-white dark:bg-gray-900 text-center'>
                <FreeTournamentForm />
            </div>
            <Footer></Footer>
        </div>
    );
}

export default AddTournament;
