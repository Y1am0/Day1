import React, { useMemo } from 'react';
import { Edit2, Trash2, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import * as FaIcons from 'react-icons/fa6';
import { IconType } from 'react-icons';
import { HabitListItemProps, IconRendererProps } from '@/../types';
import { DIFFICULTY_COLORS } from '@/app/constants';

const IconRenderer: React.FC<IconRendererProps> = ({ iconName, color }) => {
  const IconComponent = FaIcons[iconName as keyof typeof FaIcons] as IconType;
  return IconComponent ? <IconComponent className="w-5 h-5" style={{ color }} /> : null;
};

export default function HabitListItem({ habit, onEdit, onDelete, isCollapsed }: HabitListItemProps) {
  const renderIcon = useMemo(() => IconRenderer, []);

  return (
    <div className="flex items-center justify-between p-2 bg-background border-b border-border h-[100px] transition-colors duration-300">
      <div className="flex items-center space-x-2">
        <span className="w-8 h-8 flex items-center justify-center">
          {renderIcon({ iconName: habit.icon, color: habit.color })}
        </span>
        {!isCollapsed && <span className="flex-1 truncate text-foreground transition-colors duration-300">{habit.name}</span>}
      </div>
      {!isCollapsed ? (
        <div className="flex flex-col gap-y-1 items-center w-14">
          <span className={`text-xs px-2 py-1 text-neutral-50 rounded-full ${DIFFICULTY_COLORS[habit.difficulty]}`}>
            {habit.difficulty}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4 text-muted-foreground transition-colors duration-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover text-popover-foreground">
              <DropdownMenuItem onSelect={() => onEdit(habit)} className="text-foreground">
                <Edit2 className="w-4 h-4 mr-2 text-muted-foreground" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onDelete(habit.id)} className="text-foreground">
                <Trash2 className="w-4 h-4 mr-2 text-muted-foreground" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <div className={`w-2 h-2 rounded-full ${DIFFICULTY_COLORS[habit.difficulty]} mb-2`} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4 text-muted-foreground transition-colors duration-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover text-popover-foreground">
              <DropdownMenuItem onSelect={() => onEdit(habit)} className="text-foreground">
                <Edit2 className="w-4 h-4 mr-2 text-muted-foreground" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onDelete(habit.id)} className="text-foreground">
                <Trash2 className="w-4 h-4 mr-2 text-muted-foreground" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}