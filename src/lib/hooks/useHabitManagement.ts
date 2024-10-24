import { useState } from 'react';
import { Habit } from '@/types';
import { addHabit, editHabit, removeHabit } from '@/actions';

export function useHabitManagement(userId: string, initialHabits: Habit[]) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);

  const handleAddHabit = async (habit: Omit<Habit, "id">) => {
    const newHabit = await addHabit({ ...habit, userId });
    setHabits((prevHabits) => [...prevHabits, newHabit]);
    return newHabit;
  };

  const handleEditHabit = async (updatedHabit: Habit) => {
    await editHabit(updatedHabit);
    setHabits((prevHabits) =>
      prevHabits.map((h) => (h.id === updatedHabit.id ? updatedHabit : h))
    );
  };

  const handleRemoveHabit = async (id: string) => {
    await removeHabit(id);
    setHabits((prevHabits) => prevHabits.filter((h) => h.id !== id));
  };

  return {
    habits,
    setHabits,
    handleAddHabit,
    handleEditHabit,
    handleRemoveHabit,
  };
}
