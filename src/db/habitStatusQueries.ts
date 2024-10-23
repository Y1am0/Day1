import { db } from "@/db";
import { habits, habitStatuses } from "@/db/schema";
import { eq, and, gte, lte, inArray, asc } from "drizzle-orm";
import { format } from "date-fns";

// Get habit status for a specific habit and date, including consecutiveDays
export const getHabitStatus = async (habitId: string, date: string) => {
  return await db
    .select({
      habitId: habitStatuses.habitId,
      date: habitStatuses.date,
      status: habitStatuses.status,
      consecutiveDays: habitStatuses.consecutiveDays, // Include consecutiveDays
    })
    .from(habitStatuses)
    .where(
      and(
        eq(habitStatuses.habitId, habitId),
        eq(habitStatuses.date, new Date(date))
      )
    );
};

// Set or update the status for a habit on a specific date
export const setHabitStatus = async (
  habitId: string,
  date: string,
  status: "skipped" | "done" | "planned"
) => {
  const existingStatus = await getHabitStatus(habitId, date);

  if (existingStatus.length > 0) {
    // Update the existing status
    await db
      .update(habitStatuses)
      .set({ status })
      .where(
        and(
          eq(habitStatuses.habitId, habitId),
          eq(habitStatuses.date, new Date(date))
        )
      );
  } else {
    // Insert a new status
    await db.insert(habitStatuses).values({
      id: crypto.randomUUID(),
      habitId,
      date: new Date(date),
      status,
    });
  }
};

// Delete habit status for a specific habit and date
export const deleteHabitStatus = async (habitId: string, date: string) => {
  await db
    .delete(habitStatuses)
    .where(
      and(
        eq(habitStatuses.habitId, habitId),
        eq(habitStatuses.date, new Date(date))
      )
    );
};

// Get habit statuses for multiple dates, including consecutiveDays
export const getHabitStatusesForDates = async (
  habitIds: string[],
  startDate: string,
  endDate: string
) => {
  return await db
    .select({
      id: habitStatuses.id,
      habitId: habitStatuses.habitId,
      date: habitStatuses.date,
      status: habitStatuses.status,
      consecutiveDays: habitStatuses.consecutiveDays, // Fetch consecutiveDays
    })
    .from(habitStatuses)
    .where(
      and(
        inArray(habitStatuses.habitId, habitIds),
        gte(habitStatuses.date, new Date(startDate)),
        lte(habitStatuses.date, new Date(endDate))
      )
    );
};

// Fetch all logs for a given habit
export const getAllHabitLogs = async (habitId: string) => {
  return await db
    .select()
    .from(habitStatuses)
    .where(eq(habitStatuses.habitId, habitId))
    .orderBy(asc(habitStatuses.date));
};

// Recalculate consecutive days streak based on habit logs and frequency
export const revalidateHabitStreak = async (habitId: string) => {
  // Retrieve the habit's frequency
  const habitResult = await db
    .select({
      id: habits.id,
      frequency: habits.frequency,
    })
    .from(habits)
    .where(eq(habits.id, habitId));

  // The result is an array, so we access the first item
  const habit = habitResult[0];

  if (!habit) {
    throw new Error(`Habit with id ${habitId} not found`);
  }

  const logs = await getAllHabitLogs(habitId); // Get all logs for the habit
  const frequency = habit.frequency; // Habit frequency (e.g., [], ['Thu', 'Fri', 'Sat', 'Sun'])

  let consecutiveDays = 0;
  let previousDate: Date | null = null;
  let lastDoneDate: Date | null = null; // Track the last `done` date

  // Iterate through each log and update the streak
  for (const log of logs) {
    const currentDate = new Date(log.date);

    if (previousDate) {
      const daysDiff = Math.floor(
        (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check if the difference between logs is more than 1 day and requires a reset
      if (daysDiff > 1) {
        for (let i = 1; i < daysDiff; i++) {
          const missingDate = new Date(previousDate);
          missingDate.setDate(previousDate.getDate() + i);

          // Check if the missing date is part of the habit's frequency
          if (isHabitDay(missingDate, frequency)) {
            // If a required day is missing, reset the streak
            consecutiveDays = 0;
            lastDoneDate = null;
            break; // Reset the streak and stop checking further gaps
          }
        }
      }
    }

    // Handle the current log
    if (log.status === "done") {
      // Start a new streak if no previous `done` log, otherwise increment the streak
      consecutiveDays = lastDoneDate ? consecutiveDays + 1 : 1;
      lastDoneDate = currentDate; // Track the last `done` date
    }

    // Update the consecutive streak for this log in the DB
    await db
      .update(habitStatuses)
      .set({ consecutiveDays })
      .where(eq(habitStatuses.id, log.id));

    previousDate = currentDate;
  }
};

// Helper function to check if the current date matches the habit frequency
const isHabitDay = (currentDate: Date, frequency: string[]): boolean => {
  if (frequency.length === 0) {
    return true; // If frequency is empty, the habit is performed every day
  }
  const dayOfWeek = format(currentDate, "EEE"); // Get the day of the week (e.g., 'Mon', 'Tue')
  return frequency.includes(dayOfWeek); // Check if the day is in the frequency
};
