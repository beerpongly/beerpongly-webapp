import React, {useState, useEffect} from 'react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useRouter } from 'next/router'
import { Database } from '@/types/supabase'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Tournament } from '@/components/tournamentBrackets';

type ListItem = {
  id: number;
  text: string;
};

type Tournaments = Database['public']['Tables']['tournaments']['Row']
type Matches = Database['public']['Tables']['matches']['Row']

const SortableList: React.FC = () => {
  const router = useRouter();
  const supabase = useSupabaseClient<Database>()
  const [tournaments, setTournaments] = useState<Tournament>()
  const [list, setList] = useState<ListItem[]>([
    // { id: 1, text: 'Item 1' },
    // { id: 2, text: 'Item 2' },
    // { id: 3, text: 'Item 3' },
    // { id: 4, text: 'Item 4' },
  ]);
  const [playTournamentHTML, setPlayTournamentHTML] = useState(<div></div>)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      // activationConstraint: {
      //   delay: 250,
      //   tolerance: 5,
      // },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const newList = [...list];
    const { active, over } = event;
    
    if (!over) {
      return;
    }
    
    const oldIndex = newList.findIndex(item => item.id === active.id);
    const newIndex = newList.findIndex(item => item.id === over.id);

    const [removed] = newList.splice(oldIndex, 1);
    newList.splice(newIndex, 0, removed);

    setList(newList);
  };

  async function setOrder() {
    console.log(list)
    const teams: string[] = []
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      teams.push(element.text);
    }
    if (tournaments) {
      const { data, error } = await supabase
        .from('tournaments')
        .update({ teams: teams })
        .eq('id', tournaments.id)
        .select()

      router.push('/tournaments/' + tournaments.id)
    }
  }

  const refreshData = () => {
    console.log("updating data")
    setPlayTournamentHTML(
      <SortableContext items={list} strategy={verticalListSortingStrategy}>
            {list.map(item => (
              <SortableItem key={item.id} id={item.id} text={item.text} />
            ))}
      </SortableContext>
    )
  }

  const fetchTournaments = async () => {
      try {
          if (typeof router.query.tournament == "string") {
            const { data: data, error } = await supabase
              .from('tournaments')
              .select('*')
              .eq('id', Number(router.query.tournament))
              .order('id', { ascending: true })
            if (error || data.length != 1) console.error('error', error)
            else {
              console.log(data)
              setTournaments(data[0]);
            } // Update the state with fetched data
          }
      } catch (error) {
          console.error('Error fetching tournaments:', error);
      }
  };

  function displayTournaments() {
    const listClone: ListItem[] = []
    console.log(tournaments)
    if (tournaments) {
      for (let i = 0; i < tournaments.teams.length; i++) {
        const team = tournaments.teams[i];
        listClone.push({id: i + 1, text: team})
      }
    }
    setList(listClone)
  }

  useEffect(() => {
    if (router.isReady) {
      fetchTournaments();
    }
  }, [router.isReady]);

  useEffect(() => {
    if (router.isReady) {
      displayTournaments();
    }
  }, [tournaments]);

  useEffect(() => {
    if (router.isReady) {
      refreshData()
    }
  }, [list]);

  return (
    <div>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
          {playTournamentHTML}

      </DndContext>
      <button onClick={setOrder}>Save</button>
    </div>
  );
};

const SortableItem: React.FC<{ id: number; text: string }> = ({ id, text }) => {
  const { attributes, listeners, setNodeRef, transform, transition, setActivatorNodeRef } = useSortable({ id });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    transition,
    cursor: 'grab',
    padding: '10px',
    margin: '5px',
    backgroundColor: '#f0f0f0',
  };

  return (
    <li ref={setNodeRef} style={style}>
      {text}
      <button className='float-right' ref={setActivatorNodeRef} {...listeners}>Drag handle</button>
    </li>
  );
};

export default SortableList;
