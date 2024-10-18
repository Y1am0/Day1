import React, { useMemo } from 'react';
import { Edit2, Trash2, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import * as FaIcons from 'react-icons/fa6';
import { IconType } from 'react-icons';
import { HabitListItemProps, IconRendererProps } from '@/types';
import { DIFFICULTY_COLORS, COLOR_HEX_MAP } from '@/app/constants';

const IconRenderer: React.FC<IconRendererProps> = ({ iconName, color }) => {
  const IconComponent = FaIcons[iconName as keyof typeof FaIcons] as IconType;
  const iconColor = COLOR_HEX_MAP[color as keyof typeof COLOR_HEX_MAP];

  return IconComponent ? (
    <IconComponent 
      className="w-5 h-5 transition-colors duration-300" 
      style={{ color: iconColor }}
    />
  ) : null;
};

export default function HabitListItem({ habit, onEdit, onDelete, isCollapsed }: HabitListItemProps) {
  const renderIcon = useMemo(() => IconRenderer, []);

  return (
    <div className="flex items-center justify-between p-2 bg-background border-b border-border h-[100px] transition-all duration-300">
      <div className="flex items-center space-x-2">
        <span className="w-8 h-8 flex items-center justify-center transition-colors duration-300">
          {renderIcon({ iconName: habit.icon, color: habit.color })}
        </span>
        {!isCollapsed && (
          <span className="flex-1 truncate text-foreground transition-colors duration-300">
            {habit.name}
          </span>
        )}
      </div>
      {!isCollapsed ? (
        <div className="flex flex-col gap-y-1 items-center w-14">
          <span className={`text-xs px-2 py-1 text-neutral-50 rounded-full ${DIFFICULTY_COLORS[habit.difficulty]} transition-colors duration-300`}>
            {habit.difficulty}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="transition-colors duration-300">
                <Settings className="w-4 h-4 text-muted-foreground transition-colors duration-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover text-popover-foreground">
              <DropdownMenuItem onSelect={() => onEdit(habit)} className="text-foreground transition-colors duration-300">
                <Edit2 className="w-4 h-4 mr-2 text-muted-foreground transition-colors duration-300" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onDelete(habit.id)} className="text-foreground transition-colors duration-300">
                <Trash2 className="w-4 h-4 mr-2 text-muted-foreground transition-colors duration-300" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <div className={`w-2 h-2 rounded-full ${DIFFICULTY_COLORS[habit.difficulty]} mb-2 transition-colors duration-300`} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="transition-colors duration-300">
                <Settings className="w-4 h-4 text-muted-foreground transition-colors duration-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover text-popover-foreground">
              <DropdownMenuItem onSelect={() => onEdit(habit)} className="text-foreground transition-colors duration-300">
                <Edit2 className="w-4 h-4 mr-2 text-muted-foreground transition-colors duration-300" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onDelete(habit.id)} className="text-foreground transition-colors duration-300">
                <Trash2 className="w-4 h-4 mr-2 text-muted-foreground transition-colors duration-300" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}