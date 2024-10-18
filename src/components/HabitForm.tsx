import React, { useState, useEffect, useReducer } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import * as FaIcons from "react-icons/fa6";
import { IconType } from "react-icons";
import { HabitFormProps, FormState, FormAction } from "@/types";
import { COLORS, SUGGESTED_HABITS } from "@/app/constants";

function habitFormReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.payload };
    case "SET_PREDEFINED_HABIT":
      return { ...state, name: action.payload.name, icon: action.payload.icon };
    case "SET_DIFFICULTY":
      return { ...state, difficulty: action.payload };
    case "SET_COLOR":
      return { ...state, color: action.payload };
    case "SET_ICON":
      return { ...state, icon: action.payload };
    case "SET_HABIT_TYPE":
      return { ...state, habitType: action.payload };
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
  });  

  const [searchTerm, setSearchTerm] = useState("");
  const [isIconSearchOpen, setIsIconSearchOpen] = useState(false);
  const [isLoadingIcons, setIsLoadingIcons] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.name) {
      // Show an error message or prevent form submission
      return;
    }
    onSubmit({ ...state });
    onClose(); // Close form after submission
  };

  const filteredIcons = Object.keys(FaIcons).filter((name) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderIcon = (iconName: string) => {
    const IconComponent = FaIcons[iconName as keyof typeof FaIcons] as IconType;
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  useEffect(() => {
    if (isIconSearchOpen) {
      setIsLoadingIcons(true);
      import("react-icons/fa6").then(() => {
        setIsLoadingIcons(false);
      });
    }
  }, [isIconSearchOpen]);

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
              : filteredIcons.map((iconName) => (
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
        <RadioGroup
          value={state.habitType}
          onValueChange={(value: "suggested" | "custom") =>
            dispatch({ type: "SET_HABIT_TYPE", payload: value })
          }
          className="flex space-x-4 mt-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="suggested" id="suggested" />
            <Label htmlFor="suggested">Suggested</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="custom" id="custom" />
            <Label htmlFor="custom">Create Your Own</Label>
          </div>
        </RadioGroup>
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
                  <span className="ml-2">{state.name || "Select an icon"}</span>
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
