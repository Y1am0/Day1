import React, { useReducer, useState, useEffect } from "react";
import { ChevronLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import * as FaIcons from "react-icons/fa6";
import { IconType } from "react-icons";
import { HabitFormProps, FormState, FormAction } from "@/types";
import { COLORS, DAYS_OF_WEEK, SUGGESTED_HABITS } from "@/app/constants";

function habitFormReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_NAME":
    case "SET_DIFFICULTY":
    case "SET_COLOR":
    case "SET_ICON":
    case "SET_FREQUENCY":
      return { ...state, [action.type.toLowerCase().slice(4)]: action.payload };
    case "SET_HABIT_TYPE":
      return { ...state, habitType: action.payload };
    case "SET_PREDEFINED_HABIT":
      return { ...state, ...action.payload };
    case "TOGGLE_DAY":
      const updatedDays = state.frequency.includes(action.payload)
        ? state.frequency.filter((day) => day !== action.payload)
        : [...state.frequency, action.payload];
      return { ...state, frequency: updatedDays };
    default:
      return state;
  }
}

export default function HabitForm({
  onSubmit,
  initialHabit = null,
  onClose,
}: HabitFormProps) {
  const [state, dispatch] = useReducer(habitFormReducer, {
    name: initialHabit?.name || "",
    difficulty: initialHabit?.difficulty || "Easy",
    color: initialHabit?.color || Object.values(COLORS)[0],
    icon: initialHabit?.icon || "FaDumbbell",
    habitType: initialHabit ? "custom" : "suggested",
    frequency: initialHabit?.frequency || [],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isIconSearchOpen, setIsIconSearchOpen] = useState(false);
  const [isLoadingIcons, setIsLoadingIcons] = useState(true);

  useEffect(() => {
    if (isIconSearchOpen) {
      setIsLoadingIcons(true);
      import("react-icons/fa6").then(() => {
        setIsLoadingIcons(false);
      });
    }
  }, [isIconSearchOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.name) {
      // Show an error message or prevent form submission
      return;
    }
    onSubmit({ ...state });
    onClose();
  };

  const handleSelect = (value: "suggested" | "custom") => {
    dispatch({ type: "SET_HABIT_TYPE", payload: value });
  };

  const handleFrequencyChange = (type: "everyday" | "custom") => {
    dispatch({
      type: "SET_FREQUENCY",
      payload: type === "everyday" ? [] : state.frequency,
    });
  };

  const toggleDay = (day: string) => {
    dispatch({ type: "TOGGLE_DAY", payload: day });
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = FaIcons[iconName as keyof typeof FaIcons] as IconType;
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  if (isIconSearchOpen) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setIsIconSearchOpen(false)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h2 className="text-lg font-semibold">Select an Icon</h2>
        </div>
        <div className="flex items-center border rounded-md p-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search icons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 focus-visible:ring-0"
          />
        </div>
        <ScrollArea className="h-[300px] border rounded-md">
          <div className="grid grid-cols-6 gap-2 p-4 place-items-center">
            {isLoadingIcons
              ? Array.from({ length: 30 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-10" />
                ))
              : Object.keys(FaIcons)
                  .filter((name) =>
                    name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((iconName) => (
                    <Button
                      key={iconName}
                      variant="outline"
                      className="h-10 w-10 p-0 flex items-center justify-center"
                      onClick={() => {
                        dispatch({ type: "SET_ICON", payload: iconName });
                        setIsIconSearchOpen(false);
                      }}
                    >
                      {renderIcon(iconName)}
                    </Button>
                  ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Habit Type</Label>
        <div className="flex space-x-4 mt-1">
          <Button
            type="button"
            variant={state.habitType === "suggested" ? "default" : "outline"}
            onClick={() => handleSelect("suggested")}
          >
            Suggested
          </Button>
          <Button
            type="button"
            variant={state.habitType === "custom" ? "default" : "outline"}
            onClick={() => handleSelect("custom")}
          >
            Create Your Own
          </Button>
        </div>
      </div>

      {state.habitType === "suggested" ? (
        <div>
          <Label>Suggested Habit</Label>
          <Select
            onValueChange={(value) => {
              const habit = SUGGESTED_HABITS.find((h) => h.name === value);
              if (habit) {
                dispatch({ type: "SET_PREDEFINED_HABIT", payload: habit });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a suggested habit" />
            </SelectTrigger>
            <SelectContent>
              {SUGGESTED_HABITS.map((habit) => (
                <SelectItem key={habit.name} value={habit.name}>
                  <div className="flex items-center">
                    {renderIcon(habit.icon)}
                    <span className="ml-2">{habit.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <>
          <div>
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              value={state.name}
              onChange={(e) =>
                dispatch({ type: "SET_NAME", payload: e.target.value })
              }
              className="bg-background text-foreground border-border"
              required
            />
          </div>
          <div>
            <Label>Icon</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => setIsIconSearchOpen(true)}
            >
              {state.icon ? (
                <>
                  {renderIcon(state.icon)}
                  <span className="ml-2 overflow-hidden whitespace-nowrap">
                    {state.name || "Select an icon"}
                  </span>
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Select an icon
                </>
              )}
            </Button>
          </div>
        </>
      )}

      <div>
        <Label htmlFor="difficulty">Difficulty</Label>
        <Select
          value={state.difficulty}
          onValueChange={(value: "Easy" | "Medium" | "Hard") =>
            dispatch({ type: "SET_DIFFICULTY", payload: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Color</Label>
        <div className="flex space-x-2 mt-1">
          {Object.entries(COLORS).map(([name, color]) => (
            <button
              key={name}
              type="button"
              className={`w-8 h-8 rounded-full ${color} ${
                state.color === color
                  ? "ring-2 ring-offset-2 ring-gray-500"
                  : ""
              }`}
              onClick={() => dispatch({ type: "SET_COLOR", payload: color })}
            />
          ))}
        </div>
      </div>

      <div>
        <Label>Frequency</Label>
        <div className="mt-2 space-y-2">
          <Button
            type="button"
            variant={state.frequency.length === 0 ? "default" : "outline"}
            onClick={() => handleFrequencyChange("everyday")}
            className="w-full justify-center"
          >
            Everyday
          </Button>
          <div className="grid grid-cols-7 gap-1">
            {DAYS_OF_WEEK.map((day) => (
              <Button
                key={day}
                type="button"
                variant={state.frequency.includes(day) ? "default" : "outline"}
                onClick={() => toggleDay(day)}
                className="w-full h-10 p-0 text-xs"
              >
                {day.slice(0, 1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="outline"
          className="bg-primary text-primary-foreground"
        >
          {initialHabit ? "Update Habit" : "Add Habit"}
        </Button>
      </div>
    </form>
  );
}
