import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { HabitListItemProps } from "@/types";
import IconRenderer from "./IconRenderer";
import DeleteConfirmation from "../Dialogs/DeleteConfirmation";
import HabitActions from "./HabitActions";
import HabitDifficulty from "./HabitDifficulty";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { DIFFICULTY_COLORS } from "@/app/constants";

export default function HabitListItem({
  habit,
  onEdit,
  onDelete,
  isCollapsed,
}: HabitListItemProps) {
  const renderIcon = useMemo(() => IconRenderer, []);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleConfirmDelete = () => {
    onDelete(habit.id);
    setIsDeleteOpen(false);
  };

  return (
    <div className="flex items-center justify-between p-2 border-b border-border h-[100px] transition-all duration-300">
      <div className="flex items-center space-x-2">
        <span className="w-8 h-8 flex items-center justify-center transition-colors duration-300">
          {renderIcon({ iconName: habit.icon, color: habit.color })}
        </span>
        {!isCollapsed && (
          <span className="flex-1 w-36 text-foreground transition-colors duration-300">
            {habit.name}
          </span>
        )}
      </div>
      {!isCollapsed ? (
        <div className="flex flex-col gap-y-1 items-center w-14">
          <HabitDifficulty difficulty={habit.difficulty} />
          <HabitActions
            onEdit={() => onEdit(habit)}
            onDelete={() => setIsDeleteOpen(true)}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <div
            className={`w-2 h-2 rounded-full ${
              DIFFICULTY_COLORS[habit.difficulty]
            } mb-2 transition-colors duration-300`}
          />
          <HabitActions
            onEdit={() => onEdit(habit)}
            onDelete={() => setIsDeleteOpen(true)}
          />
        </div>
      )}

      {isDesktop ? (
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                <DeleteConfirmation
                  habitName={habit.name}
                  onCancel={() => setIsDeleteOpen(false)}
                  onConfirm={handleConfirmDelete}
                />
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-center">
                Confirm Deletion
              </DrawerTitle>
              <DrawerDescription>
                <DeleteConfirmation
                  habitName={habit.name}
                  onCancel={() => setIsDeleteOpen(false)}
                  onConfirm={handleConfirmDelete}
                />
              </DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
