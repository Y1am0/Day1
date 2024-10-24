"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useOptimistic,
} from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import Sidebar from "./Sidebar";
import Calendar from "./Calendar";
import EditHabitDialog from "@/components/Dialogs/EditHabitDialog";
import AddHabitDialog from "@/components/Dialogs/AddHabitDialog";
import FloatingMessage from "@/components/FloatingMessage";
import { Button } from "@/components/ui/button";
import { Habit, HabitStatus } from "@/types";
import { normalizeDate } from "@/lib/habitUtils";
import { useDates } from "@/lib/hooks/useDates";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import {
  fetchHabits,
  addHabit,
  editHabit,
  removeHabit,
  fetchHabitStatuses,
  toggleHabitStatus,
} from "@/actions";

// Utility: Check if a date matches the habit's frequency
const isHabitDay = (date: Date, frequency: string[]): boolean => {
  if (frequency.length === 0) {
    // If frequency is empty, the habit can be done any day
    return true;
  }
  const dayOfWeek = format(date, "EEE"); // 'Mon', 'Tue', etc.
  return frequency.includes(dayOfWeek); // Check if this day matches the frequency
};

// Utility: Recalculate the streak across all known dates
const recalculateStreakForDates = (
  habitId: string,
  statusMap: Map<string, Map<string, { status: string; consecutiveDays?: number }>>,
  frequency: string[]
): Map<string, Map<string, { status: string; consecutiveDays: number }>> => {
  const updatedStatusMap = new Map(statusMap); // Copy the status map
  const dates = Array.from(statusMap.keys()).sort(); // Sort dates chronologically
  let streak = 0;
  let lastDoneDate: string | null = null;

  // Iterate through the dates in order
  for (const currentDate of dates) {
    const habitLog = updatedStatusMap.get(currentDate)?.get(habitId);

    if (!habitLog) continue; // Skip if no entry for this habit on this date

    const currentLogStatus = habitLog.status;

    if (currentLogStatus === "done") {
      if (lastDoneDate) {
        const daysDiff = Math.floor(
          (new Date(currentDate).getTime() - new Date(lastDoneDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Check if there's a gap between the last `done` and current date, and if that gap is on habit days
        if (daysDiff > 1) {
          for (let i = 1; i < daysDiff; i++) {
            const missingDate = new Date(lastDoneDate);
            missingDate.setDate(missingDate.getDate() + i);
            const normalizedMissingDate = normalizeDate(missingDate);

            if (isHabitDay(missingDate, frequency)) {
              streak = 0; // Reset the streak if we missed a habit day
              break;
            }
          }
        }
      }

      // Increment the streak since this date is `done`
      streak += 1;
      lastDoneDate = currentDate;
    } else {
      streak = 0; // Reset streak if the habit is skipped or planned
    }

    // Update the consecutiveDays for the current date, ensuring it's a number
    updatedStatusMap.get(currentDate)?.set(habitId, {
      ...habitLog,
      consecutiveDays: streak,
    });
  }

  return updatedStatusMap; // Return the updated map with recalculated streaks
};


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
  const [floatingMessage, setFloatingMessage] = useState<{
    message: string;
    position: { top: number };
  } | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [loadingStatus, setLoadingStatus] = useState<{ [key: string]: boolean }>({});

  const updateLoadingStatus = (habitId: string, date: string, isLoading: boolean) => {
    setLoadingStatus((prev) => ({
      ...prev,
      [`${habitId}-${date}`]: isLoading,
    }));
  };

  // Optimistic state for habit status
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    habitStatus,
    (prev: HabitStatus, { habitId, date, nextStatus }) => {
      const newStatus = new Map(prev); // Clone the previous status map
      const dateStatus = newStatus.get(date) || new Map(); // Get the status for the current date
  
      // Update the status for the toggled date
      if (nextStatus === "skipped") {
        dateStatus.delete(habitId); // If skipped, remove it from the map
      } else {
        dateStatus.set(habitId, { status: nextStatus, consecutiveDays: dateStatus.get(habitId)?.consecutiveDays ?? 0 }); // Ensure consecutiveDays is always a number
      }
  
      newStatus.set(date, dateStatus); // Update the status map with the toggled date
  
      // Find the habit
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return newStatus; // If the habit is not found, return the status
  
      // Recalculate the streak for the entire visible date range
      const recalculatedStatusMap = recalculateStreakForDates(habitId, newStatus, habit.frequency);
  
      return recalculatedStatusMap; // Return the updated status map with recalculated streaks
    }
  );
  

  // Fetch habits when component mounts
  useEffect(() => {
    const loadHabits = async () => {
      const userHabits = await fetchHabits(user.id);
      setHabits(userHabits);
    };

    loadHabits();
  }, [user.id]);

  // Fetch habit statuses when dates or habits change
  useEffect(() => {
    const loadHabitStatuses = async () => {
      if (habits.length > 0) {
        const habitIds = habits.map((habit) => habit.id);
        const startDate = normalizeDate(dates[0]); // Use the utility function
        const endDate = normalizeDate(dates[dates.length - 1]); // Use the utility function
  
        const statuses = await fetchHabitStatuses(habitIds, startDate, endDate);
        const statusMap: HabitStatus = new Map();
  
        // Process fetched statuses
        statuses.forEach((status) => {
          const date = normalizeDate(status.date);
          if (!statusMap.has(date)) {
            statusMap.set(date, new Map());
          }
          statusMap.get(date)?.set(status.habitId, {
            status: status.status,
            consecutiveDays: status.consecutiveDays ?? 0, // Default to 0 if undefined
          });
        });
  
        habits.forEach((habit) => {
          dates.forEach((date) => {
            const dayOfWeek = format(date, "EEE");
            const dateStr = normalizeDate(date);
            const habitStatuses = statusMap.get(dateStr) || new Map();
  
            if (!habitStatuses.has(habit.id)) {
              if (
                habit.frequency.length > 0 &&
                !habit.frequency.includes(dayOfWeek)
              ) {
                // If frequency is not empty and the day is not in the frequency, set as 'planned'
                habitStatuses.set(habit.id, { status: "planned", consecutiveDays: 0 });
              }
              // If frequency is empty (every day) or the day is in the frequency, we don't set any status
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
  const handleAddHabit = async (habit: Omit<Habit, "id">) => {
    const newHabit = await addHabit({ ...habit, userId: user.id });
    setHabits((prevHabits) => [...prevHabits, newHabit]);
    setIsAddHabitOpen(false);

    // Show floating message when a habit is added
    if (isSidebarCollapsed && sidebarRef.current) {
      const newHabitIndex = habits.length;
      const habitHeight = 40; // Approximate height of a habit item
      const topOffset = 100; // Height of the sidebar header
      const position = { top: topOffset + newHabitIndex * habitHeight };
      setFloatingMessage({
        message: `Added habit: ${newHabit.name}`,
        position,
      });
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
    setHabits((prevHabits) =>
      prevHabits.map((h) => (h.id === updatedHabit.id ? updatedHabit : h))
    );
    setIsEditHabitOpen(false);
    setEditingHabit(null);
  };

  // Delete habit
  const handleRemoveHabit = async (id: string) => {
    await removeHabit(id);
    setHabits((prevHabits) => prevHabits.filter((h) => h.id !== id));
  };

  const handleToggleStatus = async (habitId: string, date: string) => {
    const currentStatusEntry = habitStatus.get(date)?.get(habitId);
    const currentStatus = currentStatusEntry?.status || "skipped";
    const nextStatus =
      currentStatus === "skipped"
        ? "done"
        : currentStatus === "done"
        ? "planned"
        : "skipped";

    // Optimistic state update
    setOptimisticStatus({ habitId, date, nextStatus });

    try {
      // Sync server with new status
      await toggleHabitStatus(habitId, date, nextStatus);

      // Fetch updated statuses from server
      const updatedStatuses = await fetchHabitStatuses(
        [habitId],
        normalizeDate(dates[0]),
        normalizeDate(dates[dates.length - 1])
      );

      // Update UI with server response
      setHabitStatusState((prev: HabitStatus) => {
        const newStatus = new Map(prev);
        updatedStatuses.forEach((status) => {
          const statusDate = normalizeDate(status.date);
          const dateStatus = newStatus.get(statusDate) || new Map();
          dateStatus.set(status.habitId, {
            status: status.status,
            consecutiveDays: status.consecutiveDays,
          });
          newStatus.set(statusDate, dateStatus);
        });
        return newStatus;
      });
    } catch (error) {
      console.error("Failed to toggle status:", error);

      // Revert optimistic update on failure
      setHabitStatusState((prev: HabitStatus) => {
        const newStatus = new Map(prev);
        const dateStatus = newStatus.get(date) || new Map();
        dateStatus.set(habitId, { status: currentStatus, consecutiveDays: currentStatusEntry?.consecutiveDays ?? 0 });
        newStatus.set(date, dateStatus);
        return newStatus;
      });
    } finally {
      updateLoadingStatus(habitId, date, false); // Reset loading state
    }
  };

  // Scroll to today's date
  const scrollToToday = () => {
    const todayElement = document.querySelector(
      `[data-date="${normalizeDate(new Date())}"]`
    );
    todayElement?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  useEffect(() => {
    scrollToToday();
  }, []);

  // Update floating message position when habits or sidebar state change
  const updateFloatingMessagePosition = useCallback(() => {
    if (floatingMessage) {
      const habitIndex = habits.findIndex(
        (h) => h.name === floatingMessage.message.replace("Added habit: ", "")
      );
      if (habitIndex !== -1) {
        const habitHeight = 100; // Approximate height of a habit item
        const topOffset = 100; // Height of the sidebar header
        const newPosition = { top: topOffset + habitIndex * habitHeight };
        if (newPosition.top !== floatingMessage.position.top) {
          setFloatingMessage((prev) =>
            prev ? { ...prev, position: newPosition } : null
          );
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
          loadingStatus={loadingStatus}
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
