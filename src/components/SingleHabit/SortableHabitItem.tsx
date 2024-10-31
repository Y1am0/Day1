import { Habit } from "@/types";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import HabitListItem from "./HabitListItem";
import { CSS } from "@dnd-kit/utilities";

interface SortableHabitItemProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  isCollapsed: boolean;
  activeId: UniqueIdentifier | null;
}

const SortableHabitItem: React.FC<SortableHabitItemProps> = ({
  habit,
  onEdit,
  onDelete,
  isCollapsed,
  activeId,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: habit.id,
  });

  const adjustedTransform = {
    x: 0,
    y: transform?.y ?? 0,
    scaleX: transform?.scaleX ?? 1,
    scaleY: transform?.scaleY ?? 1,
  };

  const style = {
    transform: CSS.Transform.toString(adjustedTransform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isDragging ? "bg-background/75 backdrop-blur-md" : ""} ${
        !isDragging && activeId ? "animate-pulse" : ""
      }`}
    >
      <HabitListItem
        habit={habit}
        onEdit={onEdit}
        onDelete={onDelete}
        isCollapsed={isCollapsed}
      />
    </div>
  );
};

export default SortableHabitItem;
