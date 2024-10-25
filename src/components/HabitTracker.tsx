"use client";

import React, { useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import Sidebar from "./Sidebar";
import Calendar from "./Calendar";
import EditHabitDialog from "@/components/Dialogs/EditHabitDialog";
import AddHabitDialog from "@/components/Dialogs/AddHabitDialog";
import FloatingMessage from "@/components/FloatingMessage";
import { Button } from "@/components/ui/button";
import { normalizeDate } from "@/lib/habitUtils";
import { useDates } from "@/lib/hooks/useDates";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useHabitStatus } from "@/lib/hooks/useHabitStatus";
import { useHabitManagement } from "@/lib/hooks/useHabitManagement";
import { useFloatingMessage } from "@/lib/hooks/useFloatingMessage";
import { useDialogManagement } from "@/lib/hooks/useDialogManagement";
import { Habit } from "@/types";
import { fetchHabits } from '@/actions';

type HabitTrackerProps = {
  user: { id: string };
};

export default function HabitTracker({ user }: HabitTrackerProps) {
  const { dates, loadMoreDates } = useDates();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(!isDesktop);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const { habits, setHabits, handleAddHabit, handleEditHabit, handleRemoveHabit } = useHabitManagement(user.id, []);
  const { optimisticStatus, loadingStatus, handleToggleStatus } = useHabitStatus(habits, dates);
  const { floatingMessage, setFloatingMessage, updateFloatingMessagePosition, showFloatingMessage } = useFloatingMessage(habits);
  const { isAddHabitOpen, isEditHabitOpen, editingHabit, openAddHabitDialog, closeAddHabitDialog, openEditHabitDialog, closeEditHabitDialog } = useDialogManagement();

  useEffect(() => {
    setIsSidebarCollapsed(!isDesktop);
  }, [isDesktop]);

  useEffect(() => {
    updateFloatingMessagePosition();
  }, [isSidebarCollapsed, updateFloatingMessagePosition]);

  useEffect(() => {
    const loadHabits = async () => {
      const userHabits = await fetchHabits(user.id);
      setHabits(userHabits);
    };

    loadHabits();
  }, [user.id, setHabits]);

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

  const handleAddHabitWithMessage = async (habit: Omit<Habit, "id">) => {
    const newHabit = await handleAddHabit(habit);
    closeAddHabitDialog();

    if (isSidebarCollapsed && sidebarRef.current) {
      const newHabitIndex = habits.length;
      const habitHeight = 40;
      const topOffset = 100;
      const position = { top: topOffset + newHabitIndex * habitHeight };
      showFloatingMessage(`Added habit: ${newHabit.name}`, position);
    }
  };

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
          isDesktop={isDesktop}
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
        onClick={openAddHabitDialog}
      >
        <Plus className="w-full" />
      </Button>

      <AddHabitDialog
        isOpen={isAddHabitOpen}
        onOpenChange={closeAddHabitDialog}
        onSubmit={handleAddHabitWithMessage}
        isDesktop={isDesktop}
      />

      <EditHabitDialog
        isOpen={isEditHabitOpen}
        onOpenChange={closeEditHabitDialog}
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
