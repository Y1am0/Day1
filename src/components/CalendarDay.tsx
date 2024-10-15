import React from 'react';
import { format, isSameDay } from 'date-fns';
import * as FaIcons from 'react-icons/fa6';
import { CalendarDayProps } from '@/../types';

export default function CalendarDay({ date, habits, habitStatus, toggleStatus }: CalendarDayProps) {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const isCurrentDay = isSameDay(date, new Date());

  return (
    <div className="w-[100px] border-r border-border transition-colors duration-300" data-date={formattedDate}>
      <div className={`h-[100px] text-center p-2 border-b border-border sticky top-0 ${isCurrentDay ? 'bg-primary/10' : 'bg-background'} flex flex-col justify-center transition-colors duration-300`}>
        <div className="font-bold text-foreground">{format(date, 'EEE')}</div>
        <div className="text-2xl text-foreground">{format(date, 'd')}</div>
        <div className="text-xs uppercase text-muted-foreground">{format(date, 'MMM')}</div>
      </div>
      {habits.map(habit => {
        const status = habitStatus.get(formattedDate)?.get(habit.id) || 'skipped';
        return (
          <div
            key={`${habit.id}-${formattedDate}`}
            className={`h-[100px] border-b border-border flex items-center justify-center cursor-pointer transition-colors duration-300 ${
              status === 'done' ? habit.color :
              status === 'planned' ? `${habit.color} bg-opacity-50` :
              'bg-muted'
            }`}
            onClick={() => toggleStatus(habit.id, formattedDate)}
            title={`Click to toggle status`} 
          >
            {status === 'done' && <FaIcons.FaCheck className="w-8 h-8 text-background" />}
            {status === 'planned' && <FaIcons.FaClock className="w-8 h-8 text-background" />}
          </div>
        );
      })}
    </div>
  );
}