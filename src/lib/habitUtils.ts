import { useState, useEffect } from 'react'
import { subDays } from 'date-fns'
import { Habit, HabitStatus } from '@/types'

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

export function useDates(initialDays: number = 30) {
  const [dates, setDates] = useState<Date[]>(() => {
    const today = new Date()
    return Array.from({ length: initialDays }, (_, i) => subDays(today, i)).reverse()
  })

  const loadMoreDates = () => {
    setDates(prevDates => {
      const oldestDate = prevDates[0]
      const newDates = Array.from({ length: initialDays }, (_, i) => subDays(oldestDate, i + 1)).reverse()
      return [...newDates, ...prevDates]
    })
  }

  return { dates, loadMoreDates }
}

export function loadSavedHabits(): Habit[] {
  const savedHabits = localStorage.getItem('habits')
  return savedHabits ? JSON.parse(savedHabits) : []
}

export function loadSavedHabitStatus(): HabitStatus {
  const savedStatus = localStorage.getItem('habitStatus')
  if (savedStatus) {
    const parsedStatus = JSON.parse(savedStatus)
    const newStatus = new Map<string, Map<string, 'done' | 'planned' | 'skipped'>>()
    Object.entries(parsedStatus).forEach(([date, statuses]) => {
      newStatus.set(date, new Map(Object.entries(statuses as Record<string, 'done' | 'planned' | 'skipped'>)))
    })
    return newStatus
  }
  return new Map()
}

export function saveHabitsToLocalStorage(habits: Habit[]): void {
  localStorage.setItem('habits', JSON.stringify(habits))
}

export function saveHabitStatusToLocalStorage(habitStatus: HabitStatus): void {
  const statusObject: Record<string, Record<string, 'done' | 'planned' | 'skipped'>> = {}
  habitStatus.forEach((dateStatus, date) => {
    statusObject[date] = Object.fromEntries(dateStatus)
  })
  localStorage.setItem('habitStatus', JSON.stringify(statusObject))
}

export function toggleHabitStatus(
  habitStatus: HabitStatus,
  habitId: string,
  date: string
): HabitStatus {
  const newStatus = new Map(habitStatus)
  if (!newStatus.has(date)) {
    newStatus.set(date, new Map())
  }
  const dateStatus = newStatus.get(date)!
  const current = dateStatus.get(habitId) || 'skipped'
  const next = current === 'skipped' ? 'done' : current === 'done' ? 'planned' : 'skipped'
  dateStatus.set(habitId, next)
  return newStatus
}