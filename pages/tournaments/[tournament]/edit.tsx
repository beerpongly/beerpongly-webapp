import React, {useState} from 'react';
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

type ListItem = {
  id: string;
  text: string;
};

const SortableList: React.FC = () => {
  const [list, setList] = useState<ListItem[]>([
    { id: '1', text: 'Item 1' },
    { id: '2', text: 'Item 2' },
    { id: '3', text: 'Item 3' },
    { id: '4', text: 'Item 4' },
  ]);
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

  function showOrder() {
    console.log(list)
  }

  return (
    <div>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={list} strategy={verticalListSortingStrategy}>
            {list.map(item => (
              <SortableItem key={item.id} id={item.id} text={item.text} />
            ))}
        </SortableContext>
      </DndContext>
      <button onClick={showOrder}>Show Order</button>
    </div>
  );
};

const SortableItem: React.FC<{ id: string; text: string }> = ({ id, text }) => {
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
