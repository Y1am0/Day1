import { HabitStatus } from '@/types'
import { format } from 'date-fns';


export const toggleHabitStatus = (
  habitStatus: HabitStatus,
  habitId: string,
  date: string
): HabitStatus => {
  const newStatus = new Map(habitStatus);
  if (!newStatus.has(date)) {
    newStatus.set(date, new Map());
  }
  const dateStatus = newStatus.get(date)!;
  const current = dateStatus.get(habitId)?.status || 'skipped'; // Get the current status
  const consecutiveDays = dateStatus.get(habitId)?.consecutiveDays; // Preserve consecutiveDays if it exists
  const next = current === 'skipped' ? 'done' : current === 'done' ? 'planned' : 'skipped';

  dateStatus.set(habitId, { status: next, consecutiveDays }); // Keep consecutiveDays when toggling
  return newStatus;
}

// Utility function to normalize dates to 'yyyy-MM-dd' format (local date)
export const normalizeDate = (date: Date | string): string => {
  return format(new Date(date), 'yyyy-MM-dd');
};
