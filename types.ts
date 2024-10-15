export type Habit = {
  id: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  color: string;
  icon: string;
};

export type HabitStatus = Map<string, Map<string, 'done' | 'planned' | 'skipped'>>;

export type FormState = Omit<Habit, 'id'> & { habitType: 'suggested' | 'custom' };

export type FormAction =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_PREDEFINED_HABIT'; payload: { name: string; icon: string } }
  | { type: 'SET_DIFFICULTY'; payload: 'Easy' | 'Medium' | 'Hard' }
  | { type: 'SET_COLOR'; payload: string }
  | { type: 'SET_ICON'; payload: string }
  | { type: 'SET_HABIT_TYPE'; payload: 'suggested' | 'custom' };

export type IconRendererProps = {
  iconName: string;
  color: string;
};

export type HabitListItemProps = {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  isCollapsed: boolean;
};

export interface CalendarDayProps {
    date: Date;
    habits: { id: string; color: string }[];
    habitStatus: Map<string, Map<string, 'done' | 'planned' | 'skipped'>>;
    toggleStatus: (habitId: string, date: string) => void;
}


export type HabitFormProps = {
  onSubmit: (habit: Omit<Habit, 'id'>) => void;
  initialHabit?: Habit | null;
  onClose: () => void;
};