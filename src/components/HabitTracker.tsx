'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import Sidebar from './Sidebar'
import Calendar from './Calendar'
import EditHabitDialog from '@/components/EditHabitDialog'
import AddHabitDialog from '@/components/AddHabitDialog'
import FloatingMessage from '@/components/FloatingMessage'
import { Button } from "@/components/ui/button"
import { Habit, HabitStatus } from '@/types'
import {
  
  useMediaQuery,
  useDates,
  loadSavedHabits,
  loadSavedHabitStatus,
  saveHabitsToLocalStorage,
  saveHabitStatusToLocalStorage,
} from '@/lib/habitUtils'

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitStatus, setHabitStatus] = useState<HabitStatus>(new Map())
  const { dates, loadMoreDates: originalLoadMoreDates } = useDates()
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false)
  const [isEditHabitOpen, setIsEditHabitOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(!isDesktop)
  const [floatingMessage, setFloatingMessage] = useState<{ message: string; position: { top: number } } | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsSidebarCollapsed(!isDesktop)
  }, [isDesktop])

  useEffect(() => {
    setHabits(loadSavedHabits())
    setHabitStatus(loadSavedHabitStatus())
  }, [])

  useEffect(() => {
    if (habits.length > 0) {
      saveHabitsToLocalStorage(habits)
    }
  }, [habits])

  useEffect(() => {
    if (habitStatus.size > 0) {
      saveHabitStatusToLocalStorage(habitStatus)
    }
  }, [habitStatus])

  const loadMoreDates = useCallback(async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        originalLoadMoreDates();
        resolve();
      }, 1000);
    });
  }, [originalLoadMoreDates]);

  const toggleStatus = (habitId: string, date: string) => {
    setHabitStatus(prev => {
      const newHabitStatus = new Map(prev);
      const dateStatus = new Map(newHabitStatus.get(date) || new Map());
      const currentStatus = dateStatus.get(habitId) || 'skipped';
      const nextStatus = currentStatus === 'skipped' ? 'done' :
                         currentStatus === 'done' ? 'planned' : 'skipped';
      dateStatus.set(habitId, nextStatus);
      newHabitStatus.set(date, dateStatus);
      return newHabitStatus;
    });
  };

  const addHabit = (habit: Omit<Habit, 'id'>) => {
    const newHabit = { ...habit, id: Date.now().toString() }
    setHabits(prevHabits => {
      const updatedHabits = [...prevHabits, newHabit]
      if (isSidebarCollapsed) {
        const newHabitIndex = updatedHabits.length - 1
        const habitHeight = 40 // Approximate height of a habit item
        const topOffset = 100 // Height of the sidebar header
        const position = {
          top: topOffset + newHabitIndex * habitHeight
        }
        setFloatingMessage({
          message: `Added habit: ${newHabit.name}`,
          position
        })
      }
      return updatedHabits
    })
    setIsAddHabitOpen(false)
  }

  const editHabit = (updatedHabit: Habit) => {
    setHabits(prevHabits => prevHabits.map(h => h.id === updatedHabit.id ? updatedHabit : h))
    setIsEditHabitOpen(false)
    setEditingHabit(null)
  }

  const deleteHabit = (id: string) => {
    setHabits(prevHabits => {
      const updatedHabits = prevHabits.filter(h => h.id !== id)
      saveHabitsToLocalStorage(updatedHabits)
      return updatedHabits
    })
  
    setHabitStatus(prev => {
      const newStatus = new Map(prev)
      Array.from(newStatus.entries()).forEach(([date, statuses]) => {
        statuses.delete(id)
        if (statuses.size === 0) {
          newStatus.delete(date)
        }
      })
      return newStatus
    })
  }

  const scrollToToday = () => {
    const todayElement = document.querySelector(`[data-date="${format(new Date(), 'yyyy-MM-dd')}"]`)
    todayElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  useEffect(() => {
    scrollToToday()
  }, [])

  const updateFloatingMessagePosition = useCallback(() => {
    if (floatingMessage) {
      const habitIndex = habits.findIndex(h => h.name === floatingMessage.message.replace('Added habit: ', ''))
      if (habitIndex !== -1) {
        const habitHeight = 40 // Approximate height of a habit item
        const topOffset = 100 // Height of the sidebar header
        const newPosition = {
          top: topOffset + habitIndex * habitHeight
        }
        if (newPosition.top !== floatingMessage.position.top) {
          setFloatingMessage(prev => prev ? { ...prev, position: newPosition } : null)
        }
      }
    }
  }, [habits, floatingMessage])

  useEffect(() => {
    updateFloatingMessagePosition()
  }, [isSidebarCollapsed, updateFloatingMessagePosition])

  return (
    <div className="flex flex-col h-screen bg-background text-foreground transition-colors duration-300">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          ref={sidebarRef}
          habits={habits}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          onEditHabit={(habit) => {
            setEditingHabit(habit)
            setIsEditHabitOpen(true)
          }}
          onDeleteHabit={deleteHabit}
          scrollToToday={scrollToToday}
        />
        <Calendar
          dates={dates}
          habits={habits}
          habitStatus={habitStatus}
          toggleStatus={toggleStatus}
          loadMoreDates={loadMoreDates}
        />
      </div>
      <Button
        className="fixed bottom-6 right-6 rounded-full size-14 shadow-lg"
        onClick={() => setIsAddHabitOpen(true)}
      >
        <Plus className="w-full" />
      </Button>
      <EditHabitDialog
        isOpen={isEditHabitOpen}
        onOpenChange={setIsEditHabitOpen}
        onSubmit={editHabit}
        editingHabit={editingHabit}
        isDesktop={isDesktop}
      />
      <AddHabitDialog
        isOpen={isAddHabitOpen}
        onOpenChange={setIsAddHabitOpen}
        onSubmit={addHabit}
        isDesktop={isDesktop}
      />
      {floatingMessage && (
        <FloatingMessage
          message={floatingMessage.message}
          position={floatingMessage.position}
          onDismiss={() => setFloatingMessage(null)}
        />
      )}
    </div>
  )
}