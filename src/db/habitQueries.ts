import { db } from "@/db";
import { habits } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Habit } from '@/types';


// Fetch all habits for a user
export const getUserHabits = async (userId: string) => {
  return await db.select().from(habits).where(eq(habits.userId, userId));
};

// Insert a new habit
export const insertHabit = async (habit: Omit<Habit, 'id'> & { userId: string }) => {
  const newHabit = { ...habit, id: crypto.randomUUID() };
  await db.insert(habits).values(newHabit);
  return newHabit;
};

// Update an existing habit
export const updateHabit = async (updatedHabit: Habit) => {
  await db.update(habits)
    .set(updatedHabit)
    .where(eq(habits.id, updatedHabit.id));
};

// Delete a habit
export const deleteHabit = async (habitId: string) => {
  await db.delete(habits).where(eq(habits.id, habitId));
};
