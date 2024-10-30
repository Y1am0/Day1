import React from "react";
import { Edit2, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HabitActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

const HabitActions: React.FC<HabitActionsProps> = ({ onEdit, onDelete }) => {
  const handleDeleteClick = () => {
    onDelete();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          className="bg-transparent hover:bg-foreground/10 transition-colors duration-300"
        >
          <Settings className="w-4 h-4 text-muted-foreground transition-colors duration-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-popover text-popover-foreground">
        <DropdownMenuItem
          onSelect={onEdit}
          className="text-foreground transition-colors duration-300"
        >
          <Edit2 className="w-4 h-4 mr-2 text-muted-foreground transition-colors duration-300" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={handleDeleteClick}
          className="text-foreground transition-colors duration-300"
        >
          <Trash2 className="w-4 h-4 mr-2 text-muted-foreground transition-colors duration-300" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HabitActions;
