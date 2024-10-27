import { format } from 'date-fns';

// Utility function to normalize dates to 'yyyy-MM-dd' format (local date)
export const normalizeDate = (date: Date | string): string => {
  return format(new Date(date), 'yyyy-MM-dd');
};

export const scrollToToday = () => {
  const todayElement = document.querySelector(
    `[data-date="${normalizeDate(new Date())}"]`
  );
  todayElement?.scrollIntoView({
    behavior: "smooth",

  });
};