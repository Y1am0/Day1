import { useState, useEffect, useOptimistic } from 'react';
import { HabitStatus, Habit } from '@/types';
import { normalizeDate } from '@/lib/habitUtils';
import { fetchHabitStatuses, toggleHabitStatus } from '@/actions';
import { format } from 'date-fns';

export function useHabitStatus(habits: Habit[], dates: Date[]) {
  const [habitStatus, setHabitStatusState] = useState<HabitStatus>(new Map());
  const [loadingStatus, setLoadingStatus] = useState<{ [key: string]: boolean }>({});

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

  const updateLoadingStatus = (habitId: string, date: string, isLoading: boolean) => {
    setLoadingStatus((prev) => ({
      ...prev,
      [`${habitId}-${date}`]: isLoading,
    }));
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

    dates.forEach((d) => {
      const normalizedDate = normalizeDate(d);
      updateLoadingStatus(habitId, normalizedDate, true);
    });

    setOptimisticStatus({ habitId, date, nextStatus });

    try {
      await toggleHabitStatus(habitId, date, nextStatus);

      const updatedStatuses = await fetchHabitStatuses(
        [habitId],
        normalizeDate(dates[0]),
        normalizeDate(dates[dates.length - 1])
      );

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
          updateLoadingStatus(status.habitId, statusDate, false);
        });
        return newStatus;
      });
    } catch (error) {
      console.error("Failed to toggle status:", error);
      setHabitStatusState((prev: HabitStatus) => {
        const newStatus = new Map(prev);
        const dateStatus = newStatus.get(date) || new Map();
        dateStatus.set(habitId, { status: currentStatus });
        newStatus.set(date, dateStatus);
        return newStatus;
      });
    } finally {
      updateLoadingStatus(habitId, date, false);
    }
  };

  return {
    optimisticStatus,
    loadingStatus,
    handleToggleStatus,
  };
}