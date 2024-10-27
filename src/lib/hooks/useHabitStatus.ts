import { useState, useEffect, useReducer, useRef } from "react";
import { HabitStatus, Habit } from "@/types";
import { normalizeDate } from "@/lib/habitUtils";
import { fetchHabitStatuses, toggleHabitStatus } from "@/actions";
import { format } from "date-fns";

// Reducer to handle loading status for each habit-date combination
const loadingStatusReducer = (
  state: { [key: string]: boolean },
  action: { type: string; habitId: string; date: string; isLoading: boolean }
) => {
  const { habitId, date, isLoading } = action;
  const key = `${habitId}-${date}`;
  switch (action.type) {
    case "UPDATE_LOADING_STATUS":
      return { ...state, [key]: isLoading };
    default:
      return state;
  }
};

export function useHabitStatus(habits: Habit[], dates: Date[]) {
  const [habitStatus, setHabitStatusState] = useState<HabitStatus>(new Map());
  const [loadingStatus, dispatchLoadingStatus] = useReducer(
    loadingStatusReducer,
    {}
  );

  // Version tracking to ensure latest server response is applied
  const versionRef = useRef<{ [key: string]: number }>({});

  // Load all initial habit statuses
  useEffect(() => {
    const loadHabitStatuses = async () => {
      if (habits.length > 0) {
        const habitIds = habits.map((habit) => habit.id);
        const startDate = normalizeDate(dates[0]);
        const endDate = normalizeDate(dates[dates.length - 1]);

        const statuses = await fetchHabitStatuses(habitIds, startDate, endDate);
        const statusMap: HabitStatus = new Map();

        statuses.forEach((status) => {
          const date = normalizeDate(status.date);
          if (!statusMap.has(date)) {
            statusMap.set(date, new Map());
          }
          statusMap.get(date)?.set(status.habitId, {
            status: status.status,
            consecutiveDays: status.consecutiveDays ?? undefined,
          });
        });

        // Populate statusMap with placeholders for planned days without status
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
                habitStatuses.set(habit.id, { status: "planned" });
              }
              statusMap.set(dateStr, habitStatuses);
            }
          });
        });

        setHabitStatusState(statusMap);
      }
    };

    loadHabitStatuses();
  }, [habits, dates]);

  const updateLoadingStatus = (
    habitId: string,
    date: string,
    isLoading: boolean
  ) => {
    dispatchLoadingStatus({
      type: "UPDATE_LOADING_STATUS",
      habitId,
      date,
      isLoading,
    });
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
  
    // Increment version for habitId to track this specific toggle action
    const requestVersion = (versionRef.current[habitId] || 0) + 1;
    versionRef.current[habitId] = requestVersion;
  
    // Optimistic update to reflect UI change immediately
    setHabitStatusState((prev: HabitStatus) => {
      const newStatus = new Map(prev);
      const dateStatus = newStatus.get(date) || new Map();
      dateStatus.set(habitId, { status: nextStatus });
      newStatus.set(date, dateStatus);
      return newStatus;
    });
  
    dates.forEach((d) => {
      const normalizedDate = normalizeDate(d);
      updateLoadingStatus(habitId, normalizedDate, true); // Set loading state
    });
  
    try {
      // Perform the toggle operation on the server
      await toggleHabitStatus(habitId, date, nextStatus);
  
      // Fetch the updated statuses to ensure correct state, especially consecutiveDays
      const updatedStatuses = await fetchHabitStatuses(
        [habitId],
        normalizeDate(dates[0]),
        normalizeDate(dates[dates.length - 1])
      );
  
      // Only apply if this response is for the latest request version
      if (versionRef.current[habitId] === requestVersion) {
        setHabitStatusState((prev: HabitStatus) => {
          const newStatus = new Map(prev);
          updatedStatuses.forEach((status) => {
            const statusDate = normalizeDate(status.date);
            const dateStatus = newStatus.get(statusDate) || new Map();
            dateStatus.set(status.habitId, {
              status: status.status,
              consecutiveDays: status.consecutiveDays ?? undefined,
            });
            newStatus.set(statusDate, dateStatus);
          });
  
          // Clear loading status for all affected dates, ensuring it stops in sync
          dates.forEach((d) => {
            const normalizedDate = normalizeDate(d);
            updateLoadingStatus(habitId, normalizedDate, false);
          });
  
          return newStatus;
        });
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
  
      // Revert to original status if there’s an error
      setHabitStatusState((prev: HabitStatus) => {
        const newStatus = new Map(prev);
        const dateStatus = newStatus.get(date) || new Map();
        dateStatus.set(habitId, { status: currentStatus });
        newStatus.set(date, dateStatus);
  
        // Clear loading status on error as well
        dates.forEach((d) => {
          const normalizedDate = normalizeDate(d);
          updateLoadingStatus(habitId, normalizedDate, false);
        });
  
        return newStatus;
      });
    }
  };
  

  return {
    habitStatus,    // The confirmed server-synced statuses
    loadingStatus,  // Loading status for each habit-date combination
    handleToggleStatus,  // Function to toggle habit status with version control
  };
}
