import { useState } from 'react';
import { Habit } from '@/types';

export function useDialogManagement() {
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [isEditHabitOpen, setIsEditHabitOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const openAddHabitDialog = () => setIsAddHabitOpen(true);
  const closeAddHabitDialog = () => setIsAddHabitOpen(false);

  const openEditHabitDialog = (habit: Habit) => {
    setEditingHabit(habit);
    setIsEditHabitOpen(true);
  };
  const closeEditHabitDialog = () => {
    setEditingHabit(null);
    setIsEditHabitOpen(false);
  };

  return {
    isAddHabitOpen,
    isEditHabitOpen,
    editingHabit,
    openAddHabitDialog,
    closeAddHabitDialog,
    openEditHabitDialog,
    closeEditHabitDialog,
  };
}

