// types/types.d.ts
import { Session } from '@supabase/auth-helpers-react'

export type CreateTournamentForm = {
    tournamentName: string;
    roundRobin: boolean;
    teams: string[];
  };
  
export type TournamentFormProps = {
      onSubmit: (createTournamentForm: CreateTournamentForm) => void;
      session: Session;
};
  