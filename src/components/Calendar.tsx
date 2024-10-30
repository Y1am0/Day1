import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Loader2 } from "lucide-react";
import CalendarDay from "./CalendarDay";
import { Habit, HabitStatus } from "@/types";
import { normalizeDate } from "@/lib/habitUtils";

interface CalendarProps {
  verticalScrollRef: React.RefObject<HTMLDivElement>;
  dates: Date[];
  habits: Habit[];
  habitStatus: HabitStatus;
  toggleStatus: (habitId: string, date: string) => void;
  loadMoreDates: () => Promise<void> | void;
  loadingStatus: { [key: string]: boolean };
  extraBottomSpace: number; // New prop for additional space
}

const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      dates,
      habits,
      habitStatus,
      toggleStatus,
      loadMoreDates,
      loadingStatus,
      verticalScrollRef,
      extraBottomSpace, // Destructure the new prop here
    },
    ref
  ) => {
    const calendarRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [draggingDistance, setDraggingDistance] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const prevDatesLengthRef = useRef(dates.length);

    // Intersection observer callback to trigger date loading
    const handleIntersection = useCallback(
      (entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading) {
          setIsLoading(true);
          Promise.resolve(loadMoreDates()).finally(() => {
            setIsLoading(false);
          });
        }
      },
      [loadMoreDates, isLoading]
    );

    useEffect(() => {
      const observer = new IntersectionObserver(handleIntersection, {
        root: calendarRef.current,
        threshold: 1.0,
      });

      if (loadingRef.current) {
        observer.observe(loadingRef.current);
      }

      return () => observer.disconnect();
    }, [handleIntersection]);

    // Handle scroll position on initial load or when new dates are added
    useEffect(() => {
      const currentRef = calendarRef.current;
      if (currentRef) {
        if (initialLoad) {
          currentRef.scrollLeft =
            currentRef.scrollWidth - currentRef.clientWidth;
          setInitialLoad(false);
        } else if (dates.length > prevDatesLengthRef.current) {
          const newDatesWidth =
            (dates.length - prevDatesLengthRef.current) * 100;
          currentRef.scrollLeft += newDatesWidth;
        }
      }
      prevDatesLengthRef.current = dates.length;
    }, [dates, initialLoad]);

    // Combine verticalScrollRef and calendarRef into a single element
    useImperativeHandle(verticalScrollRef, () => calendarRef.current!);
    useImperativeHandle(ref, () => calendarRef.current!);

    // Mouse Move Event: Handle drag scroll
    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!isDragging || !calendarRef.current) return;
        const x = e.pageX - (calendarRef.current.offsetLeft || 0);
        const walk = x - startX;
        calendarRef.current.scrollLeft = scrollLeft - walk;
        setDraggingDistance(Math.abs(walk)); // Update dragging distance
      },
      [isDragging, startX, scrollLeft]
    );

    // Mouse Down Event: Start dragging
    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setStartX(e.pageX - (calendarRef.current?.offsetLeft || 0));
      setScrollLeft(calendarRef.current?.scrollLeft || 0);
      setDraggingDistance(0); // Reset dragging distance at start
    };

    // Mouse Up Event: Stop dragging
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    useEffect(() => {
      if (isDragging) {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      } else {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }, [isDragging, handleMouseMove]);

    return (
      <div
        ref={calendarRef}
        className="overflow-x-auto overflow-y-auto h-full"
        onMouseDown={handleMouseDown}
      >
        <div
          className="flex"
          style={{ width: `${(dates.length + 1) * 100}px` }}
        >
          {/* Loading Indicator - styled to be vertically sticky */}
          <div className="w-[100px] flex-shrink-0" ref={loadingRef}>
            <div className="h-[100px] border-r border-border flex items-center justify-center sticky top-0 z-20 backdrop-blur-md bg-background/85 transition-colors duration-300">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
            {habits.map((habit) => (
              <div
                key={`disabled-${habit.id}`}
                className="h-[100px] border-r border-border flex items-center justify-center bg-muted relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-stripe" />
              </div>
            ))}
          </div>
          {/* Calendar Days */}
          {dates.map((date) => (
            <CalendarDay
              key={normalizeDate(date)}
              date={date}
              habits={habits}
              habitStatus={habitStatus}
              toggleStatus={toggleStatus}
              loadingStatus={loadingStatus}
              isDragging={isDragging}
              draggingDistance={draggingDistance} // Pass dragging distance
            />
          ))}
        </div>
        {/* Spacer div to match the sidebar's additional height */}
        <div style={{ height: extraBottomSpace }} />
      </div>
    );
  }
);

Calendar.displayName = "Calendar";
export default Calendar;
