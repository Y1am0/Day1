'use client';

import React, { useState, useEffect, useCallback, useRef, useOptimistic } from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import Sidebar from './Sidebar';
import Calendar from './Calendar';
import EditHabitDialog from '@/components/EditHabitDialog';
import AddHabitDialog from '@/components/AddHabitDialog';
import FloatingMessage from '@/components/FloatingMessage';
import { Button } from "@/components/ui/button";
import { Habit, HabitStatus } from '@/types';
import { useMediaQuery, useDates } from '@/lib/habitUtils';
import { fetchHabits, addHabit, editHabit, removeHabit, fetchHabitStatuses, toggleHabitStatus } from '@/actions';

type HabitTrackerProps = {
  user: { id: string };
};

export default function HabitTracker({ user }: HabitTrackerProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitStatus, setHabitStatusState] = useState<HabitStatus>(new Map());
  const { dates, loadMoreDates } = useDates();
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [isEditHabitOpen, setIsEditHabitOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(!isDesktop);
  const [floatingMessage, setFloatingMessage] = useState<{ message: string; position: { top: number } } | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Optimistic state for habit status
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(habitStatus, (prev, [habitId, date, nextStatus]) => {
    const newStatus = new Map(prev);
    const dateStatus = newStatus.get(date) || new Map();

    if (nextStatus === 'skipped') {
      dateStatus.delete(habitId);
    } else {
      dateStatus.set(habitId, nextStatus);
    }
    
    newStatus.set(date, dateStatus);
    return newStatus;
  });

  // Fetch habits when the component mounts
  useEffect(() => {
    const loadHabits = async () => {
      const userHabits = await fetchHabits(user.id);
      setHabits(userHabits);
    };

    loadHabits();
  }, [user.id]);

  // Fetch habit statuses when dates change
  useEffect(() => {
    const loadHabitStatuses = async () => {
      if (habits.length > 0) {
        const habitIds = habits.map(habit => habit.id);
        const startDate = dates[0].toISOString();
        const endDate = dates[dates.length - 1].toISOString();

        const statuses = await fetchHabitStatuses(habitIds, startDate, endDate);
        const statusMap = new Map<string, Map<string, 'done' | 'planned' | 'skipped'>>();
        
        // Process fetched statuses
        statuses.forEach(status => {
          const date = status.date.toISOString().split('T')[0];
          if (!statusMap.has(date)) {
            statusMap.set(date, new Map());
          }
          statusMap.get(date)?.set(status.habitId, status.status);
        });

        habits.forEach(habit => {
          dates.forEach(date => {
            const dayOfWeek = format(date, 'EEE');
            const dateStr = date.toISOString().split('T')[0];
            const habitStatuses = statusMap.get(dateStr) || new Map();
            
            if (!habitStatuses.has(habit.id)) {
              if (habit.frequency.length > 0 && !habit.frequency.includes(dayOfWeek)) {
                // If frequency is not empty and the day is not in the frequency, set as 'planned'
                habitStatuses.set(habit.id, 'planned');
              }
              // If frequency is empty (everyday) or the day is in the frequency, we don't set any status
              statusMap.set(dateStr, habitStatuses);
            }
          });
        });

        setHabitStatusState(statusMap);
      }
    };

    loadHabitStatuses();
  }, [habits, dates]);

  // Add habit
  const handleAddHabit = async (habit: Omit<Habit, 'id'>) => {
    const newHabit = await addHabit({ ...habit, userId: user.id });
    setHabits((prevHabits) => [...prevHabits, newHabit]);
    setIsAddHabitOpen(false);

    // Show floating message when a habit is added
    if (isSidebarCollapsed && sidebarRef.current) {
      const newHabitIndex = habits.length;
      const habitHeight = 40; // Approximate height of a habit item
      const topOffset = 100; // Height of the sidebar header
      const position = { top: topOffset + newHabitIndex * habitHeight };
      setFloatingMessage({ message: `Added habit: ${newHabit.name}`, position });
    }
  };

  // Trigger edit habit modal
  const openEditHabitDialog = (habit: Habit) => {
    setEditingHabit(habit);
    setIsEditHabitOpen(true);
  };

  // Submit habit edit
  const handleEditHabit = async (updatedHabit: Habit) => {
    await editHabit(updatedHabit);
    setHabits((prevHabits) => prevHabits.map(h => h.id === updatedHabit.id ? updatedHabit : h));
    setIsEditHabitOpen(false);
    setEditingHabit(null);
  };

  // Delete habit
  const handleRemoveHabit = async (id: string) => {
    await removeHabit(id);
    setHabits((prevHabits) => prevHabits.filter(h => h.id !== id));
  };

  // Toggle habit status with optimistic update
  const handleToggleStatus = async (habitId: string, date: string) => {
    const currentStatus = habitStatus.get(date)?.get(habitId) || 'skipped';
    const nextStatus = currentStatus === 'skipped' ? 'done' : currentStatus === 'done' ? 'planned' : 'skipped';

    // Optimistic update before the server-side action
    setOptimisticStatus([habitId, date, nextStatus]);

    try {
      // Perform the server-side action to handle database sync
      await toggleHabitStatus(habitId, date, nextStatus);

      // After successful server action, ensure the UI state matches the server
      setHabitStatusState(prev => {
        const newStatus = new Map(prev);
        const dateStatus = newStatus.get(date) || new Map();
        if (nextStatus === 'skipped') {
          dateStatus.delete(habitId);
        } else {
          dateStatus.set(habitId, nextStatus);
        }
        newStatus.set(date, dateStatus);
        return newStatus;
      });
    } catch (error) {
      console.error('Failed to toggle status:', error);

      // If the server action fails, revert the optimistic update
      setHabitStatusState(prev => {
        const newStatus = new Map(prev);
        const dateStatus = newStatus.get(date) || new Map();
        if (currentStatus === 'skipped') {
          dateStatus.delete(habitId);
        } else {
          dateStatus.set(habitId, currentStatus);
        }
        newStatus.set(date, dateStatus);
        return newStatus;
      });
    }
  };

  // Scroll to today's date
  const scrollToToday = () => {
    const todayElement = document.querySelector(`[data-date="${format(new Date(), 'yyyy-MM-dd')}"]`);
    todayElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  // Scroll to today on load
  useEffect(() => {
    scrollToToday();
  }, []);

  // Update floating message position when habits or sidebar state change
  const updateFloatingMessagePosition = useCallback(() => {
    if (floatingMessage) {
      const habitIndex = habits.findIndex(h => h.name === floatingMessage.message.replace('Added habit: ', ''));
      if (habitIndex !== -1) {
        const habitHeight = 100; // Approximate height of a habit item
        const topOffset = 100; // Height of the sidebar header
        const newPosition = { top: topOffset + habitIndex * habitHeight };
        if (newPosition.top !== floatingMessage.position.top) {
          setFloatingMessage(prev => prev ? { ...prev, position: newPosition } : null);
        }
      }
    }
  }, [habits, floatingMessage]);

  useEffect(() => {
    updateFloatingMessagePosition();
  }, [isSidebarCollapsed, updateFloatingMessagePosition]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground transition-colors duration-300">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          ref={sidebarRef}
          habits={habits}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          onEditHabit={openEditHabitDialog}
          onDeleteHabit={handleRemoveHabit}
          scrollToToday={scrollToToday}
        />
        <Calendar
          dates={dates}
          habits={habits}
          habitStatus={optimisticStatus}
          toggleStatus={handleToggleStatus}
          loadMoreDates={loadMoreDates}
        />
      </div>
      <Button
        className="fixed bottom-6 right-6 rounded-full size-14 shadow-lg"
        onClick={() => setIsAddHabitOpen(true)}
      >
        <Plus className="w-full" />
      </Button>

      <AddHabitDialog
        isOpen={isAddHabitOpen}
        onOpenChange={setIsAddHabitOpen}
        onSubmit={handleAddHabit}
        isDesktop={isDesktop}
      />

      <EditHabitDialog
        isOpen={isEditHabitOpen}
        onOpenChange={setIsEditHabitOpen}
        onSubmit={handleEditHabit}
        editingHabit={editingHabit}
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
  );
}