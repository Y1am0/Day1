import { db } from "@/db";
import { habits } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { Habit } from '@/types';

// Fetch all habits for a user
export const getUserHabits = async (userId: string) => {
  return await db
    .select()
    .from(habits)
    .where(eq(habits.userId, userId))
    .orderBy(asc(habits.createdAt));
};

// Insert a new habit
export const insertHabit = async (habit: Omit<Habit, 'id'> & { userId: string }) => {
  const newHabit = { 
    ...habit, 
    id: crypto.randomUUID(),
    frequency_days: habit.frequency // Store frequency as frequency_days in the database
  };
  await db.insert(habits).values(newHabit);
  return {
    ...newHabit,
    frequency: newHabit.frequency_days // Return frequency as frequency for consistency with Habit type
  };
};

// Update an existing habit
export const updateHabit = async (updatedHabit: Habit) => {
  const habitForDb = {
    ...updatedHabit,
    frequency_days: updatedHabit.frequency // Store frequency as frequency_days in the database
  };
  await db.update(habits)
    .set(habitForDb)
    .where(eq(habits.id, updatedHabit.id));
  return updatedHabit; // Return the original updatedHabit for consistency
};

// Delete a habit
export const deleteHabit = async (habitId: string) => {
  await db.delete(habits).where(eq(habits.id, habitId));
};