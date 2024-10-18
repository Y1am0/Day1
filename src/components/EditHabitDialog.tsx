import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import HabitForm from './HabitForm';
import { Habit } from '@/types';

type EditHabitDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (habit: Habit) => void;
  editingHabit: Habit | null;
  isDesktop: boolean;
};

export default function EditHabitDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  editingHabit,
  isDesktop
}: EditHabitDialogProps) {
  if (!editingHabit) return null;

  const EditHabitContent = (
    <>
      <DialogHeader>
        <DialogTitle>Edit Habit</DialogTitle>
      </DialogHeader>
      <HabitForm
        onSubmit={(updatedHabit) => onSubmit({ ...updatedHabit, id: editingHabit.id })}
        initialHabit={editingHabit}
        onClose={() => onOpenChange(false)}
      />
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] bg-background text-foreground">
          {EditHabitContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="px-4 py-6 sm:px-6">
          {EditHabitContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
