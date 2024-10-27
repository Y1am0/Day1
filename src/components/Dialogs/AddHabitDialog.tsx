import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import HabitForm from '../HabitForm';
import { Habit } from '@/types';

type AddHabitDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (habit: Omit<Habit, 'id'>) => void;
  isDesktop: boolean;
};

export default function AddHabitDialog({ isOpen, onOpenChange, onSubmit, isDesktop }: AddHabitDialogProps) {
  const AddHabitContent = (
    <>
      <DialogHeader>
        <DialogTitle>Add New Habit</DialogTitle>
      </DialogHeader>
      <HabitForm onSubmit={onSubmit} onClose={() => onOpenChange(false)} />
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] flex flex-col bg-background text-foreground">
          {AddHabitContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="px-4 py-6 sm:px-6">{AddHabitContent}</div>
      </DrawerContent>
    </Drawer>
  );
}
