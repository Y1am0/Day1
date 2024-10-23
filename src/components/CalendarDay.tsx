import React from 'react';
import { format, isSameDay } from 'date-fns';
import { Hourglass, Check } from "lucide-react";
import { CalendarDayProps } from '@/types';

export default function CalendarDay({ date, habits, habitStatus, toggleStatus }: CalendarDayProps) {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const isCurrentDay = isSameDay(date, new Date());

  return (
    <div className="w-[100px] border-r border-border transition-all duration-300 ease-in-out" data-date={formattedDate}>
      <div className={`h-[100px] text-center p-2 border-b border-border sticky top-0 ${isCurrentDay ? 'bg-primary/10' : 'bg-background'} flex flex-col justify-center transition-all duration-300 ease-in-out`}>
        <div className="font-bold text-foreground transition-colors duration-300 ease-in-out">{format(date, 'EEE')}</div>
        <div className="text-2xl text-foreground transition-colors duration-300 ease-in-out">{format(date, 'd')}</div>
        <div className="text-xs uppercase text-muted-foreground transition-colors duration-300 ease-in-out">{format(date, 'MMM')}</div>
      </div>
      {habits.map(habit => {
        const statusEntry = habitStatus.get(formattedDate)?.get(habit.id);
        const status = statusEntry?.status || 'skipped';
        const consecutiveDays = statusEntry?.consecutiveDays;

        return (
          <div
            key={`${habit.id}-${formattedDate}`}
            className={`h-[100px] border-b border-border flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out ${
              status === 'done' ? habit.color :
              status === 'planned' ? `${habit.color} bg-opacity-10` :
              'bg-muted/50'
            }`}
            onClick={() => toggleStatus(habit.id, formattedDate)}
            title={`Click to toggle status`} 
          >
            {status === 'done' && (
              <div className="relative flex items-center justify-center h-full w-full">
                <Check className="w-8 h-8 text-white transition-colors duration-300 ease-in-out" />
                {consecutiveDays !== undefined && (
                  <div className="absolute bottom-0 right-0 text-md rounded-full bg-black/5 overflow-hidden m-1 px-2 text-white">
                    {consecutiveDays}
                  </div>
                )}
              </div>
            )}
            {status === 'planned' && <Hourglass className="size-5 text-muted-foreground dark:text-foreground transition-colors duration-300 ease-in-out" />}
          </div>
        );
      })}
    </div>
  );
}
