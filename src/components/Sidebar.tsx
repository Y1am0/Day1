import React, { forwardRef } from 'react'
import { Menu, Calendar, Sun, Moon, CircleUserRound } from 'lucide-react'
import { Button } from "@/components/ui/button"
import HabitListItem from './HabitListItem'
import { Habit } from '@/types'
import { useTheme } from './ThemeContext'
import LogoIcon from '@/app/icons/logo'
import { useSession } from "next-auth/react";
import Image from 'next/image'


interface SidebarProps {
  habits: Habit[]
  isSidebarCollapsed: boolean
  setIsSidebarCollapsed: (collapsed: boolean) => void
  onEditHabit: (habit: Habit) => void
  onDeleteHabit: (id: string) => void
  scrollToToday: () => void
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(({
  habits,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  onEditHabit,
  onDeleteHabit,
  scrollToToday
}, ref) => {
  const { theme, toggleTheme } = useTheme()
  const { data: session } = useSession();

  return (
    <div 
      ref={ref}
      className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} h-full flex-shrink-0 border-r border-border bg-background text-foreground transition-all duration-300 flex flex-col`}
    >
      <div className="flex items-center justify-between h-[100px] px-4 bg-background transition-all duration-300">
        {!isSidebarCollapsed && (
          <div className="flex items-center space-x-4 transition-all duration-300">
            <LogoIcon className="text-foreground transition-colors duration-300" />
            <span className="font-semibold text-lg text-foreground transition-colors duration-300">DayOne</span>
          </div>
        )}
        <Button className={`${isSidebarCollapsed && 'mx-auto'} p-1 transition-all duration-300`} variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
          <Menu className="w-full h-auto text-foreground transition-colors duration-300" />
        </Button>
      </div>
      <div className="flex-grow transition-all duration-300 overflow-y-auto">
        {habits.map(habit => (
          <HabitListItem
            key={habit.id}
            habit={habit}
            onEdit={onEditHabit}
            onDelete={onDeleteHabit}
            isCollapsed={isSidebarCollapsed}
          />
        ))}
      </div>
      <div className="p-4 space-y-2 transition-all duration-300">
      <Button
          variant="ghost"
          size="icon"
          className="w-full flex justify-center hover:bg-secondary transition-colors duration-300"
          title="User"
        >
          {session?.user?.image ? 
           <Image 
           src={session?.user?.image || ''} 
           alt={'user'}
           className='w-5 h-5 rounded-full object-cover'
           width={40}
           height={40}
           quality={100}
         />
         :
         <CircleUserRound width={20} height={20} />
}
          {!isSidebarCollapsed && (
            <span className="ml-2 text-foreground transition-colors duration-300">
              {session?.user?.name}
            </span>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollToToday}
          className="w-full flex justify-center hover:bg-secondary transition-colors duration-300"
          title="Scroll to Today"
        >
          <Calendar className="h-5 w-5 text-foreground transition-colors duration-300" />
          {!isSidebarCollapsed && (
            <span className="ml-2 text-foreground transition-colors duration-300">
              Today
            </span>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="w-full flex justify-center hover:bg-secondary transition-colors duration-300"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5 text-foreground transition-colors duration-300" />
          ) : (
            <Sun className="h-5 w-5 text-foreground transition-colors duration-300" />
          )}
          {!isSidebarCollapsed && (
            <span className="ml-2 text-foreground transition-colors duration-300">
              Toggle Theme
            </span>
          )}
        </Button>
      </div>
    </div>
  )
})

Sidebar.displayName = 'Sidebar'

export default Sidebar