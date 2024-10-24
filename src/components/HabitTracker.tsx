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
  const [triggerRender, setTriggerRender] = useState(false);
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

  useEffect(() => {
    // This ensures the component re-renders when triggerRender is toggled
  }, [triggerRender]);

  // Optimistic state for habit status
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    habitStatus,
    (prev: HabitStatus, { habitId, date, nextStatus }) => {
      const newStatus = new Map(prev);
      const dateStatus = newStatus.get(date) || new Map();

      if (nextStatus === "skipped") {
        dateStatus.delete(habitId);
      } else {
        dateStatus.set(habitId, { status: nextStatus });
      }

      newStatus.set(date, dateStatus);
      return newStatus;
    }
  );

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
            consecutiveDays: status.consecutiveDays ?? undefined, // Include consecutiveDays
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
                habitStatuses.set(habit.id, { status: "planned" });
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


  // Set the loading state for ALL visible dates for the toggled habit
  dates.forEach((d) => {
    const normalizedDate = normalizeDate(d);
    updateLoadingStatus(habitId, normalizedDate, true); // Mark all dates for the habit as loading
  });

  const currentConsecutiveDays = currentStatusEntry?.consecutiveDays || 0; // Fetch current consecutiveDays

    // Optimistic update before the server-side action
    setOptimisticStatus({ habitId, date, nextStatus });

    try {
      // Perform the server-side action to handle database sync
      await toggleHabitStatus(habitId, date, nextStatus);

    // Fetch the updated statuses after revalidation for this specific habit
    const updatedStatuses = await fetchHabitStatuses(
      [habitId],
      normalizeDate(dates[0]),
      normalizeDate(dates[dates.length - 1])
    );


// Ensure the toggled date is included in the UI update
setHabitStatusState((prev: HabitStatus) => {
  const newStatus = new Map(prev);
  
  // Handle the toggled date explicitly
  const toggledDateStatus = updatedStatuses.find(status => normalizeDate(status.date) === normalizeDate(date));
  if (toggledDateStatus) {
    const dateStatus = newStatus.get(date) || new Map();
    dateStatus.set(habitId, {
      status: toggledDateStatus.status,
      consecutiveDays: toggledDateStatus.consecutiveDays, // Correct consecutiveDays value
    });
    newStatus.set(date, dateStatus);
  }

  // Update other dates as usual
  updatedStatuses.forEach((status) => {
    const statusDate = normalizeDate(status.date);
    const dateStatus = newStatus.get(statusDate) || new Map();
    dateStatus.set(status.habitId, {
      status: status.status,
      consecutiveDays: status.consecutiveDays,
    });
    newStatus.set(statusDate, dateStatus);
    updateLoadingStatus(status.habitId, statusDate, false);
  });

      // Trigger re-render after state update
      setTriggerRender((prev) => !prev);

        return newStatus;
      });
    } catch (error) {
      console.error("Failed to toggle status:", error);

      // If the server action fails, revert the optimistic update
      setHabitStatusState((prev: HabitStatus) => {
        const newStatus = new Map(prev);
        const dateStatus = newStatus.get(date) || new Map();
        
        // Revert both status and consecutiveDays
        dateStatus.set(habitId, { 
          status: currentStatus, 
          consecutiveDays: currentConsecutiveDays // Revert consecutiveDays
        });
        
        newStatus.set(date, dateStatus);
        return newStatus;
      });
    } finally {
      // Reset the loading state for the toggled habit/date in case of error or success
      updateLoadingStatus(habitId, date, false);
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

  // Scroll to today on load
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
