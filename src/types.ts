export type Difficulty = "Easy" | "Medium" | "Hard";

export interface HabitDifficultyProps {
  difficulty: Difficulty; // Use the Difficulty type here
}

export type Frequency = string[];

export interface Habit {
  id: string;
  name: string;
  difficulty: Difficulty;
  color: string;
  icon: string;
  frequency: Frequency;
}

export type HabitStatus = Map<
  string,
  Map<
    string,
    { status: "done" | "planned" | "skipped"; consecutiveDays?: number }
  >
>;

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface FormState extends Omit<Habit, "id"> {
  habitType: "suggested" | "custom";
}

export type FormAction =
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_PREDEFINED_HABIT"; payload: { name: string; icon: string } }
  | { type: "SET_DIFFICULTY"; payload: Difficulty } // Reusing Difficulty type
  | { type: "SET_COLOR"; payload: string }
  | { type: "SET_ICON"; payload: string }
  | { type: "SET_HABIT_TYPE"; payload: "suggested" | "custom" }
  | { type: "SET_FREQUENCY"; payload: Frequency }
  | { type: "TOGGLE_DAY"; payload: string };

export type IconRendererProps = {
  iconName: string;
  color: string;
};

export interface DeleteConfirmationProps {
  habitName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export interface HabitListItemProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  isCollapsed: boolean;
}

export interface CalendarDayProps {
  date: Date;
  habits: { id: string; color: string }[];
  habitStatus: HabitStatus;
  toggleStatus: (habitId: string, date: string) => void;
  loadingStatus: { [key: string]: boolean };
  isDragging: boolean;
  draggingDistance: number;
}

export interface HabitFormProps {
  onSubmit: (habit: Omit<Habit, "id">) => void;
  initialHabit?: Habit | null;
  onClose: () => void;
}
