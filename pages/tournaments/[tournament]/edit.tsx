import React, { useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface Item {
  id: string;
  content: string;
}

interface DragObject {
  type: string;
  id: string;
  index: number;
}

const DraggableTable: React.FC = () => {
  const initialItems: Item[] = [
    { id: "1", content: "Item 1" },
    { id: "2", content: "Item 2" },
    { id: "3", content: "Item 3" },
    // Add more items as needed
  ];

  const [items, setItems] = useState<Item[]>(initialItems);

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const draggedItem = items[dragIndex];
    const newItems = [...items];
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, draggedItem);
    setItems(newItems);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Content</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <TableRow
              key={item.id}
              item={item}
              index={index}
              moveItem={moveItem}
            />
          ))}
        </tbody>
      </table>
    </DndProvider>
  );
};

const TableRow: React.FC<{
  item: Item;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
}> = ({ item, index, moveItem }) => {
  const [{ isDragging }, drag] = useDrag<DragObject, any, { isDragging: boolean }>({
    type: "row",
    item: { type: "row", id: item.id, index }
  });

  const ref = useRef<HTMLTableRowElement>(null);

  const [, drop] = useDrop({
    accept: "row",
    hover: (item: DragObject, monitor) => {
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      if (!hoverBoundingRect) {
        return;
      }

      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as any)?.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });

  const opacity = isDragging ? 1 : 1;

  drag(drop(ref));

  return (
    <tr ref={ref} style={{ opacity }}>
      <td>{item.id}</td>
      <td>{item.content}</td>
    </tr>
  );
};

export default DraggableTable;
