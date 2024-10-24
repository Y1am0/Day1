import { subDays } from 'date-fns'
import { useState } from 'react'

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