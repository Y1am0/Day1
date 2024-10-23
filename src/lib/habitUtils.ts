import { useState, useEffect } from 'react'
import { subDays } from 'date-fns'
import { HabitStatus } from '@/types'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    window.addEventListener("resize", listener)
    return () => window.removeEventListener("resize", listener)
  }, [matches, query])

  return matches
}

export function useDates(initialDays: number = 30, subsequentDays: number = 7) {
  const [dates, setDates] = useState<Date[]>(() => {
    const today = new Date();
    return Array.from({ length: initialDays }, (_, i) => subDays(today, i)).reverse();
  });

  const loadMoreDates = () => {
    setDates(prevDates => {
      const oldestDate = prevDates[0];
      const newDates = Array.from({ length: subsequentDays }, (_, i) => subDays(oldestDate, i + 1)).reverse();
      return [...newDates, ...prevDates];
    });
  };

  return { dates, loadMoreDates };
}


export function toggleHabitStatus(
  habitStatus: HabitStatus,
  habitId: string,
  date: string
): HabitStatus {
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
