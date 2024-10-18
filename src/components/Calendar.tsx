import React, { useRef, useEffect, useCallback, useState } from 'react'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import CalendarDay from './CalendarDay'
import { Habit, HabitStatus } from '@/types'

interface CalendarProps {
  dates: Date[]
  habits: Habit[]
  habitStatus: HabitStatus
  toggleStatus: (habitId: string, date: string) => void
  loadMoreDates: () => Promise<void> | void
}

export default function Calendar({
  dates,
  habits,
  habitStatus,
  toggleStatus,
  loadMoreDates
}: CalendarProps) {
  const calendarRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const prevDatesLengthRef = useRef(dates.length)

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && !isLoading) {
      setIsLoading(true);
      Promise.resolve(loadMoreDates()).finally(() => {
        setIsLoading(false);
      });
    }
  }, [loadMoreDates, isLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      root: calendarRef.current,
      threshold: 1.0,
    });

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [handleIntersection]);

  useEffect(() => {
    const currentRef = calendarRef.current;
    if (currentRef) {
      if (initialLoad) {
        currentRef.scrollLeft = currentRef.scrollWidth - currentRef.clientWidth;
        setInitialLoad(false);
      } else if (dates.length > prevDatesLengthRef.current) {
        const newDatesWidth = (dates.length - prevDatesLengthRef.current) * 100;
        currentRef.scrollLeft += newDatesWidth;
      }
    }
    prevDatesLengthRef.current = dates.length;
  }, [dates, initialLoad]);

  return (
    <div className="flex-1 overflow-x-scroll bg-background" ref={calendarRef}>
      <div className="flex" style={{ width: `${(dates.length + 1) * 100}px` }}>
        <div className="w-[100px] flex-shrink-0" ref={loadingRef}>
          <div className="h-[100px] border-r border-border transition-colors duration-300 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
          {habits.map((habit) => (
            <div
              key={`disabled-${habit.id}`}
              className="h-[100px] border-r border-border transition-colors duration-300 flex items-center justify-center bg-muted relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-stripe" />
            </div>
          ))}
        </div>
        {dates.map(date => (
          <CalendarDay
            key={format(date, 'yyyy-MM-dd')}
            date={date}
            habits={habits}
            habitStatus={habitStatus}
            toggleStatus={toggleStatus}
          />
        ))}
      </div>
    </div>
  )
}