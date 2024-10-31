"use client";

import React, { useRef, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Sidebar from "./Sidebar";
import Calendar from "./Calendar";
import EditHabitDialog from "@/components/Dialogs/EditHabitDialog";
import AddHabitDialog from "@/components/Dialogs/AddHabitDialog";
import FloatingMessage from "@/components/FloatingMessage";
import { Button } from "@/components/ui/button";
import { scrollToToday } from "@/lib/habitUtils";
import { useDates } from "@/lib/hooks/useDates";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useHabitStatus } from "@/lib/hooks/useHabitStatus";
import { useHabitManagement } from "@/lib/hooks/useHabitManagement";
import { useFloatingMessage } from "@/lib/hooks/useFloatingMessage";
import { useDialogManagement } from "@/lib/hooks/useDialogManagement";
import { Habit } from "@/types";
import { fetchHabits } from "@/actions";
import { updateHabitOrderAction } from "@/actions";

type HabitTrackerProps = {
  user: { id: string };
};

export default function HabitTracker({ user }: HabitTrackerProps) {
  const { dates, loadMoreDates } = useDates();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(
    !isDesktop
  );
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const calendarScrollRef = useRef<HTMLDivElement>(null);

  const sidebarExtraContentRef = useRef<HTMLDivElement>(null);
  const [extraSidebarHeight, setExtraSidebarHeight] = useState(0);

  const {
    habits,
    setHabits,
    handleAddHabit,
    handleEditHabit,
    handleRemoveHabit,
  } = useHabitManagement(user.id, []);
  const { habitStatus, loadingStatus, handleToggleStatus } = useHabitStatus(
    habits,
    dates
  );
  const {
    floatingMessage,
    setFloatingMessage,
    updateFloatingMessagePosition,
    showFloatingMessage,
  } = useFloatingMessage(habits);
  const {
    isAddHabitOpen,
    isEditHabitOpen,
    editingHabit,
    openAddHabitDialog,
    closeAddHabitDialog,
    openEditHabitDialog,
    closeEditHabitDialog,
  } = useDialogManagement();

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

  useEffect(() => {
    scrollToToday();
  }, []);

  const handleDragEnd = async (updatedHabits: Habit[]) => {
    setHabits(updatedHabits); // Update state with reordered array
    const habitOrder = updatedHabits.map((habit) => habit.id);
    const response = await updateHabitOrderAction(user.id, habitOrder);

    if (!response.success) {
      console.error("Failed to save habit order:", response.error);
      // Optionally: display an error message or revert state
    }
  };

  const syncScroll = (source: HTMLDivElement, target: HTMLDivElement) => {
    target.scrollTop = source.scrollTop;
  };

  useEffect(() => {
    const sidebar = sidebarScrollRef.current;
    const calendar = calendarScrollRef.current;

    if (sidebar && calendar) {
      const handleSidebarScroll = () => syncScroll(sidebar, calendar);
      const handleCalendarScroll = () => syncScroll(calendar, sidebar);

      sidebar.addEventListener("scroll", handleSidebarScroll);
      calendar.addEventListener("scroll", handleCalendarScroll);

      return () => {
        sidebar.removeEventListener("scroll", handleSidebarScroll);
        calendar.removeEventListener("scroll", handleCalendarScroll);
      };
    }
  }, []);

  useEffect(() => {
    if (sidebarExtraContentRef.current) {
      setExtraSidebarHeight(sidebarExtraContentRef.current.offsetHeight);
    }
  }, [isSidebarCollapsed, habits]);

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
    <div className="flex flex-col h-screen text-foreground transition-colors duration-300">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          scrollRef={sidebarScrollRef}
          ref={sidebarRef}
          habits={habits} // Pass reordered habits to Sidebar
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          onEditHabit={openEditHabitDialog}
          onDeleteHabit={handleRemoveHabit}
          scrollToToday={scrollToToday}
          extraContentRef={sidebarExtraContentRef}
          onDragEnd={handleDragEnd} // Pass drag handler
        />
        <Calendar
          verticalScrollRef={calendarScrollRef}
          dates={dates}
          habits={habits} // Pass reordered habits to Calendar
          habitStatus={habitStatus}
          toggleStatus={handleToggleStatus}
          loadMoreDates={loadMoreDates}
          loadingStatus={loadingStatus}
          extraBottomSpace={extraSidebarHeight}
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
