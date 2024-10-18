import { db } from "@/db";
import { habitStatuses } from "@/db/schema";
import { eq, and, gte, lte, inArray } from "drizzle-orm";

// Get habit status for a specific habit and date
export const getHabitStatus = async (habitId: string, date: string) => {
  return await db.select()
    .from(habitStatuses)
    .where(and(eq(habitStatuses.habitId, habitId), eq(habitStatuses.date, new Date(date))));
};

// Set or update the status for a habit on a specific date
export const setHabitStatus = async (habitId: string, date: string, status: 'skipped' | 'done' | 'planned') => {
  const existingStatus = await getHabitStatus(habitId, date);

  if (existingStatus.length > 0) {
    // Update the existing status
    await db.update(habitStatuses)
      .set({ status })
      .where(and(eq(habitStatuses.habitId, habitId), eq(habitStatuses.date, new Date(date))));
  } else {
    // Insert a new status
    await db.insert(habitStatuses).values({
      id: crypto.randomUUID(),
      habitId,
      date: new Date(date),
      status
    });
  }
};

// Delete habit status for a specific habit and date
export const deleteHabitStatus = async (habitId: string, date: string) => {
    await db.delete(habitStatuses)
      .where(and(eq(habitStatuses.habitId, habitId), eq(habitStatuses.date, new Date(date))));
  };

// Fetch habit statuses for multiple dates
export const getHabitStatusesForDates = async (habitIds: string[], startDate: string, endDate: string) => {
  return await db.select()
    .from(habitStatuses)
    .where(
      and(
        inArray(habitStatuses.habitId, habitIds),
        gte(habitStatuses.date, new Date(startDate)),
        lte(habitStatuses.date, new Date(endDate))
      )
    );
};