"use server"

import { getUserHabits, insertHabit, updateHabit, deleteHabit } from '@/db/habitQueries';
import { getHabitStatusesForDates, setHabitStatus, deleteHabitStatus } from '@/db/habitStatusQueries';
import { Habit } from '@/types';

// Fetch all habits for a user
export async function fetchHabits(userId: string): Promise<Habit[]> {
  return await getUserHabits(userId);
}

// Add a new habit
export async function addHabit(habit: Omit<Habit, 'id'> & { userId: string }) {
  return await insertHabit(habit);
}

// Edit an existing habit
export async function editHabit(updatedHabit: Habit) {
  return await updateHabit(updatedHabit);
}

// Delete a habit
export async function removeHabit(habitId: string) {
  return await deleteHabit(habitId);
}

// Fetch habit statuses for a date range
export async function fetchHabitStatuses(habitIds: string[], startDate: string, endDate: string) {
  return await getHabitStatusesForDates(habitIds, startDate, endDate);
}

// Toggle habit status
export async function toggleHabitStatus(habitId: string, date: string, status: 'skipped' | 'done' | 'planned') {
    if (status === 'skipped') {
      // If status is 'skipped', delete it from the database
      await deleteHabitStatus(habitId, date);
    } else {
      // Otherwise, insert or update the status
      await setHabitStatus(habitId, date, status);
    }
  }