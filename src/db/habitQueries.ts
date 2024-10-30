import { db } from "@/db";
import { habits } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { Habit } from "@/types";

// Fetch all habits for a user
export const getUserHabits = async (userId: string) => {
  return await db
    .select()
    .from(habits)
    .where(eq(habits.userId, userId))
    .orderBy(asc(habits.order));
};

// Insert a new habit
export const insertHabit = async (
  habit: Omit<Habit, "id"> & { userId: string }
) => {
  const newHabit = {
    ...habit,
    id: crypto.randomUUID(),
    frequency_days: habit.frequency,
  };
  await db.insert(habits).values(newHabit);
  return {
    ...newHabit,
    frequency: newHabit.frequency_days,
  };
};

// Update an existing habit
export const updateHabit = async (updatedHabit: Habit) => {
  const habitForDb = {
    ...updatedHabit,
    frequency_days: updatedHabit.frequency,
  };
  await db.update(habits).set(habitForDb).where(eq(habits.id, updatedHabit.id));
  return updatedHabit;
};

// Delete a habit
export const deleteHabit = async (habitId: string) => {
  await db.delete(habits).where(eq(habits.id, habitId));
};

// Function to update the order of habits
export const updateHabitOrder = async (
  userId: string,
  orderedHabitIds: string[]
) => {
  const queries = orderedHabitIds.map(
    (habitId, index) => sql`
      UPDATE habits
      SET "order" = ${index}
      WHERE id = ${habitId} AND "userId" = ${userId};
    `
  );

  // Execute each query in sequence
  for (const query of queries) {
    await db.execute(query);
  }
};
