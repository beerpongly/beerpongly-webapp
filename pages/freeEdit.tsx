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
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useRouter } from 'next/router'
import { MdDragHandle } from "react-icons/md";
import NavBar from '@/components/navbar';

type ListItem = {
  id: number;
  text: string;
};


const SortableList: React.FC = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState(<div></div>)
  const [list, setList] = useState<ListItem[]>([]);
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

    setOrder(newList)
  };

  async function setOrder(newList: ListItem[]) {
    console.log(newList)
    const newTeams: string[] = []
    for (let i = 0; i < newList.length; i++) {
      newTeams.push(newList[i].text);
    }
    localStorage.setItem("teams", JSON.stringify(newTeams))
    console.log("Teams: " + JSON.parse(localStorage.getItem("teams") || "[]"))
  }

  async function playTournament() {
    router.push("/freeTournament")
  }

  async function resetTournament() {
    const teams: string[] = JSON.parse(localStorage.getItem("teams") || "[]")
    let currentTeams = teams.length;
    let roundCount = 0;
    while (currentTeams > 1) {
      currentTeams /= 2;
      roundCount++;
    }

    let rounds: string[][] = []
    let count = 1;
    for (let i = roundCount; i >= 0; i--) {
      let teams: string[] = []
      for (let j = 0; j < Math.pow(2, i); j++) {
        teams.push("")
      }
      rounds.push(teams)
      count++;
    }

    localStorage.setItem("rounds", JSON.stringify(rounds))
      
    fetchTournaments()
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
    const teams: string[] = JSON.parse(localStorage.getItem("teams") || "[]")
      if (teams.length <= 0) {
        router.push("/freeCreateTournament")
      } else {
        const listClone: ListItem[] = []
        for (let i = 0; i < teams.length; i++) {
          listClone.push({id: i + 1, text: teams[i]})
        }
        setList(listClone)
      }
  };

  useEffect(() => {
    if (router.isReady) {
      fetchTournaments();
    }
  }, [router.isReady]);

  useEffect(() => {
    if (router.isReady) {
      refreshData()
    }
  }, [list]);

  return (
    <div className='w-full h-full bg-white dark:bg-gray-900 text-center'>
      <NavBar></NavBar>
      <div className='max-w-sm mx-auto h-full bg-white dark:bg-gray-900 dark:text-white text-center'>
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
            {playTournamentHTML}

        </DndContext>
        <button
          onClick={playTournament}
          className="focus:outline-none text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900"
        >
          Save
        </button>
        <button
          onClick={resetTournament}
          className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
        >
          Restart Tournament
        </button>
        <div>
          {errorMessage}
        </div>
      </div>
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
    <div ref={setNodeRef} style={style} className='text-black rounded-lg'>
      {text}
      <button className='float-right' ref={setActivatorNodeRef} {...listeners}><MdDragHandle /></button>
    </div>
  );
};

export default SortableList;
