import React, { forwardRef, useState } from "react";
import {
  Menu,
  Sun,
  Moon,
  CircleUserRound,
  LogOut,
  User,
  CalendarArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Habit } from "@/types";
import { useTheme } from "./theme/ThemeContext";
import LogoIcon from "@/app/icons/logo";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import SortableHabitItem from "./SingleHabit/SortableHabitItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface SidebarProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  habits: Habit[];
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  scrollToToday: () => void;
  onDragEnd: (updatedHabits: Habit[]) => void;
  extraContentRef: React.RefObject<HTMLDivElement>;
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      habits,
      scrollRef,
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      onEditHabit,
      onDeleteHabit,
      scrollToToday,
      onDragEnd,
      extraContentRef,
    },
    ref
  ) => {
    const { theme, toggleTheme } = useTheme();
    const { data: session } = useSession();

    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 10, // Start dragging after moving 10px vertically
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    const handleDragStart = (event: DragStartEvent) => {
      setActiveId(event.active.id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);

      if (over && active.id !== over.id) {
        const oldIndex = habits.findIndex((habit) => habit.id === active.id);
        const newIndex = habits.findIndex((habit) => habit.id === over.id);
        const updatedHabits = arrayMove(habits, oldIndex, newIndex);
        onDragEnd(updatedHabits);
      }
    };

    return (
      <div
        ref={ref}
        className={`${
          isSidebarCollapsed ? "w-20" : "w-64"
        } h-full fixed z-30 flex-shrink-0 border-r border-border bg-background/75 backdrop-blur-2xl text-foreground transition-all duration-300 flex flex-col`}
      >
        <div className="flex items-center justify-between px-4 transition-all duration-300">
          {!isSidebarCollapsed && (
            <div className="flex items-center space-x-4 transition-all duration-300">
              <LogoIcon className="text-foreground transition-colors duration-300" />
              <span className="font-semibold text-lg text-foreground transition-colors duration-300">
                DayOne
              </span>
            </div>
          )}
          <Button
            className={`${
              isSidebarCollapsed ? "mx-auto" : ""
            } h-[100px] p-1 transition-all duration-300`}
            variant="hidden"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            <Menu className="w-full h-auto text-foreground transition-colors duration-300" />
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={habits.map((habit) => habit.id)}
            strategy={verticalListSortingStrategy}
          >
            <div
              ref={scrollRef}
              className="overflow-y-auto overflow-x-hidden flex flex-col  h-full"
            >
              {habits.map((habit) => (
                <SortableHabitItem
                  key={habit.id}
                  habit={habit}
                  onEdit={onEditHabit}
                  onDelete={onDeleteHabit}
                  isCollapsed={isSidebarCollapsed}
                  activeId={activeId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div
          ref={extraContentRef}
          className="p-4 space-y-2 transition-all duration-300"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full flex justify-center items-center hover:bg-secondary transition-colors duration-300"
                title="User"
              >
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="User"
                    className="w-5 h-5 rounded-full object-cover"
                    width={40}
                    height={40}
                    quality={100}
                  />
                ) : (
                  <CircleUserRound width={20} height={20} />
                )}
                {!isSidebarCollapsed && (
                  <span className="ml-2 text-foreground transition-colors duration-300">
                    {session?.user?.name}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-popover text-popover-foreground"
              side={isSidebarCollapsed ? "right" : "top"}
            >
              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  className="flex items-center text-foreground transition-colors duration-300"
                >
                  <User className="w-4 h-4 mr-2 text-muted-foreground transition-colors duration-300" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => signOut()}
                className="text-foreground transition-colors duration-300"
              >
                <LogOut className="w-4 h-4 mr-2 text-muted-foreground transition-colors duration-300" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollToToday}
            className="w-full flex justify-center items-center hover:bg-secondary transition-colors duration-300"
            title="Scroll to Today"
          >
            <CalendarArrowDown className="h-5 w-5 text-foreground transition-colors duration-300" />
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
            className="w-full flex justify-center items-center hover:bg-secondary transition-colors duration-300"
          >
            {theme === "light" ? (
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
    );
  }
);

Sidebar.displayName = "Sidebar";
export default Sidebar;
