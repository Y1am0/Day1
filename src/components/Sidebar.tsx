import React, { forwardRef } from "react";
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
import HabitListItem from "./SingleHabit/HabitListItem";
import { Habit } from "@/types";
import { useTheme } from "./theme/ThemeContext";
import LogoIcon from "@/app/icons/logo";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";

interface SidebarProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  habits: Habit[];
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  scrollToToday: () => void;
  onDragEnd: (result: DropResult) => void;
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

        {/* Drag and Drop Context */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div
            ref={scrollRef}
            className="overflow-y-auto overflow-x-hidden flex flex-col justify-between h-full"
          >
            <Droppable droppableId="habits">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-grow transition-all duration-300"
                >
                  {habits.map((habit, index) => (
                    <Draggable
                      key={habit.id}
                      draggableId={habit.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            cursor: "grab", // Optional for better user feedback
                          }}
                        >
                          <HabitListItem
                            habit={habit}
                            onEdit={onEditHabit}
                            onDelete={onDeleteHabit}
                            isCollapsed={isSidebarCollapsed}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>

        {/* Additional Sidebar Options */}
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
